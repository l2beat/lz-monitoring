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
import { ChainId, EthereumAddress } from '@lz/libs'
import { providers } from 'ethers'

import { DiscoveryController } from '../api/controllers/discovery/DiscoveryController'
import { createDiscoveryRouter } from '../api/routes/discovery'
import { Config } from '../config'
import { AvailableConfigs, EthereumLikeDiscoveryConfig } from '../config/Config'
import { BlockNumberIndexer } from '../indexers/BlockNumberIndexer'
import { CacheInvalidationIndexer } from '../indexers/CacheInvalidationIndexer'
import { ChangelogIndexer } from '../indexers/ChangelogIndexer'
import { CurrentDiscoveryIndexer } from '../indexers/CurrentDiscoveryIndexer'
import { DiscoveryIndexer } from '../indexers/DiscoveryIndexer'
import { EventIndexer } from '../indexers/EventIndexer'
import { LatestBlockNumberIndexer } from '../indexers/LatestBlockNumberIndexer'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import { ProviderCache } from '../peripherals/clients/ProviderCache'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
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
    changelog: ChangelogRepository
    milestone: MilestoneRepository
  }
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
  const changelogRepository = new ChangelogRepository(database, logger)
  const milestoneRepository = new MilestoneRepository(database, logger)

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
        repositories: {
          blockNumber: blockRepository,
          indexerState: indexerRepository,
          discovery: discoverRepository,
          currDiscovery: currentDiscoveryRepository,
          providerCache: providerCacheRepository,
          events: eventRepository,
          changelog: changelogRepository,
          milestone: milestoneRepository,
        },
        config: submoduleConfig.config,
      },
      chainName,
      config.discovery.callsPerMinute / enabledChainConfigs.length,
      submoduleConfig.config.changelogWhitelist,
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

      for (const submodule of submodules) {
        await submodule.start?.()
      }

      statusLogger.info('Main discovery module started')
    },
  }
}

export function createDiscoverySubmodule(
  { logger, config, repositories }: DiscoverySubmoduleDependencies,
  chain: keyof Config['discovery']['modules'],
  callsPerMinute: number,
  changelogWhitelist: EthereumAddress[],
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

  const latestBlockNumberIndexer = new LatestBlockNumberIndexer(
    blockchainClient,
    logger,
    config.tickIntervalMs,
    chainId,
  )

  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    repositories.blockNumber,
    repositories.indexerState,
    config.startBlock,
    chainId,
    latestBlockNumberIndexer,
    logger,
  )

  const cacheInvalidationIndexer = new CacheInvalidationIndexer(
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
    repositories.events,
    repositories.discovery,
    repositories.indexerState,
    chainId,
    logger,
    cacheInvalidationIndexer,
    eventIndexer,
  )

  const currDiscoveryIndexer = new CurrentDiscoveryIndexer(
    repositories.discovery,
    repositories.currDiscovery,
    repositories.indexerState,
    chainId,
    logger,
    discoveryIndexer,
  )

  const changelogIndexer = new ChangelogIndexer(
    repositories.changelog,
    repositories.milestone,
    repositories.indexerState,
    repositories.discovery,
    chainId,
    changelogWhitelist,
    discoveryIndexer,
    logger,
  )

  return {
    start: async () => {
      const statusLogger = logger.for('DiscoveryModule').tag(chain)
      statusLogger.info(`Starting discovery submodule`)

      await latestBlockNumberIndexer.start()
      await blockNumberIndexer.start()
      await cacheInvalidationIndexer.start()
      await eventIndexer.start()
      await discoveryIndexer.start()
      await currDiscoveryIndexer.start()
      await changelogIndexer.start()

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
    config.unsupportedEtherscanMethods,
  )

  const discoveryLogger = config.loggerEnabled
    ? DiscoveryLogger.CLI
    : DiscoveryLogger.SILENT

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
