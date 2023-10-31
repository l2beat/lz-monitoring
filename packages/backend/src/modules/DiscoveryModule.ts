import { Logger } from '@l2beat/backend-tools'
import {
  AddressAnalyzer,
  DiscoveryEngine,
  DiscoveryLogger,
  EtherscanLikeClient,
  HandlerExecutor,
  HttpClient,
  MulticallClient,
  ProviderWithCache,
  ProxyDetector,
  RateLimitedProvider,
  SourceCodeService,
} from '@l2beat/discovery'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import { DiscoveryController } from '../api/controllers/discovery/DiscoveryController'
import { createDiscoveryRouter } from '../api/routes/discovery'
import { Config } from '../config'
import { AvailableConfigs, EthereumLikeDiscoveryConfig } from '../config/Config'
import { BlockNumberIndexer } from '../indexers/BlockNumberIndexer'
import { CacheInvalidationIndexer } from '../indexers/CacheInvalidationIndexer'
import { ClockIndexer } from '../indexers/ClockIndexer'
import { CurrentDiscoveryIndexer } from '../indexers/CurrentDiscoveryIndexer'
import { DiscoveryIndexer } from '../indexers/DiscoveryIndexer'
import { EventIndexer } from '../indexers/EventIndexer'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import { ProviderCache } from '../peripherals/clients/ProviderCache'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ProviderCacheRepository } from '../peripherals/database/ProviderCacheRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

interface DiscoverySubmoduleDependencies {
  logger: Logger
  config: EthereumLikeDiscoveryConfig
  repositories: {
    blockNumber: BlockNumberRepository
    indexerState: IndexerStateRepository
    discovery: DiscoveryRepository
    currDiscovery: CurrentDiscoveryRepository
    providerCache: ProviderCacheRepository
    events: EventRepository
  }
  clockIndexer: ClockIndexer
}

interface DiscoveryModuleDependencies {
  database: Database
  logger: Logger
  config: Config
}

export function createDiscoveryModule({
  database,
  logger,
  config,
}: DiscoveryModuleDependencies): ApplicationModule {
  const statusLogger = logger.for('DiscoveryModule')

  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)
  const eventRepository = new EventRepository(database, logger)
  const discoverRepository = new DiscoveryRepository(database, logger)
  const currentDiscoveryRepository = new CurrentDiscoveryRepository(
    database,
    logger,
  )
  const providerCacheRepository = new ProviderCacheRepository(
    database,
    Logger.SILENT,
  )

  const clockIndexer = new ClockIndexer(
    logger,
    config.discovery.clock.tickIntervalMs,
  )

  const availableChainConfigs = Object.keys(
    config.discovery.modules,
  ) as AvailableConfigs[]

  const enabledChainConfigs = availableChainConfigs.filter(
    (chainName) => config.discovery.modules[chainName].enabled,
  )

  const submodules = availableChainConfigs.flatMap((chainName) => {
    const submoduleConfig = config.discovery.modules[chainName]

    if (!submoduleConfig.enabled) {
      statusLogger.warn('Discovery submodule disabled', { chainName })
      return []
    }

    return createDiscoverySubmodule(
      {
        logger,
        clockIndexer,
        repositories: {
          blockNumber: blockRepository,
          indexerState: indexerRepository,
          discovery: discoverRepository,
          currDiscovery: currentDiscoveryRepository,
          providerCache: providerCacheRepository,
          events: eventRepository,
        },
        config: submoduleConfig.config,
      },
      chainName,
      config.discovery.callsPerMinute / enabledChainConfigs.length,
    )
  })

  const discoveryController = new DiscoveryController(
    currentDiscoveryRepository,
  )
  const discoveryRouter = createDiscoveryRouter(discoveryController)

  return {
    routers: [discoveryRouter],
    start: async () => {
      statusLogger.info('Starting discovery module')

      await clockIndexer.start()

      for (const submodule of submodules) {
        await submodule.start?.()
      }

      statusLogger.info('Main discovery module started')
    },
  }
}

export function createDiscoverySubmodule(
  {
    logger,
    config,
    repositories,
    clockIndexer,
  }: DiscoverySubmoduleDependencies,
  chain: keyof Config['discovery']['modules'],
  callsPerMinute: number,
): ApplicationModule {
  const chainId = ChainId.fromName(chain)

  const provider = new providers.StaticJsonRpcProvider(config.rpcUrl)
  const rateLimitedProvider = new RateLimitedProvider(provider, callsPerMinute)
  const blockchainClient = new BlockchainClient(rateLimitedProvider, logger)

  const discoveryEngine = createDiscoveryEngine(
    rateLimitedProvider,
    repositories.providerCache,
    config,
    chainId,
  )

  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    repositories.blockNumber,
    repositories.indexerState,
    config.startBlock,
    chainId,
    clockIndexer,
    logger,
  )

  const cacheInvalidationIndexer = new CacheInvalidationIndexer(
    repositories.blockNumber,
    repositories.providerCache,
    repositories.indexerState,
    chainId,
    logger,
    blockNumberIndexer,
  )

  const eventIndexer = new EventIndexer(
    blockchainClient,
    repositories.blockNumber,
    repositories.events,
    repositories.indexerState,
    chainId,
    config.eventsToWatch,
    {
      startBlock: config.startBlock,
      maxBlockBatchSize: config.rpcLogsMaxRange,
      amtBatches: config.eventIndexerAmtBatches,
    },
    blockNumberIndexer,
    logger,
  )

  const discoveryIndexer = new DiscoveryIndexer(
    discoveryEngine,
    config.discovery,
    repositories.blockNumber,
    repositories.events,
    repositories.discovery,
    repositories.indexerState,
    chainId,
    logger,
    cacheInvalidationIndexer,
    eventIndexer,
  )

  const currDiscoveryIndexer = new CurrentDiscoveryIndexer(
    repositories.blockNumber,
    repositories.discovery,
    repositories.currDiscovery,
    repositories.indexerState,
    chainId,
    logger,
    discoveryIndexer,
  )

  return {
    start: async () => {
      const statusLogger = logger.for('DiscoveryModule').tag(chain)
      statusLogger.info(`Starting discovery submodule`)

      await blockNumberIndexer.start()
      await cacheInvalidationIndexer.start()
      await eventIndexer.start()
      await discoveryIndexer.start()
      await currDiscoveryIndexer.start()

      statusLogger.info(`Discovery submodule  started`)
    },
  }
}

function createDiscoveryEngine(
  provider: RateLimitedProvider,
  cacheRepository: ProviderCacheRepository,
  config: EthereumLikeDiscoveryConfig,
  chainId: ChainId,
): DiscoveryEngine {
  const httpClient = new HttpClient()

  const discoveryClient = new EtherscanLikeClient(
    httpClient,
    config.blockExplorerApiUrl,
    config.blockExplorerApiKey,
    config.blockExplorerMinTimestamp,
  )

  const discoveryLogger = DiscoveryLogger.CLI

  const providerCache = new ProviderCache(cacheRepository)
  const discoveryProvider = new ProviderWithCache(
    provider,
    discoveryClient,
    discoveryLogger,
    chainId,
    providerCache,
    config.rpcLogsMaxRange,
  )
  const multicallClient = new MulticallClient(
    discoveryProvider,
    config.multicall,
  )

  const proxyDetector = new ProxyDetector(discoveryProvider, discoveryLogger)
  const sourceCodeService = new SourceCodeService(discoveryProvider)
  const handlerExecutor = new HandlerExecutor(
    discoveryProvider,
    multicallClient,
    discoveryLogger,
  )
  const addressAnalyzer = new AddressAnalyzer(
    discoveryProvider,
    proxyDetector,
    sourceCodeService,
    handlerExecutor,
    discoveryLogger,
  )
  return new DiscoveryEngine(addressAnalyzer, discoveryLogger)
}
