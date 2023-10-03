import { Logger } from '@l2beat/backend-tools'
import {
  AddressAnalyzer,
  DiscoveryEngine,
  DiscoveryLogger,
  DiscoveryProvider,
  EtherscanLikeClient,
  HandlerExecutor,
  HttpClient,
  ProxyDetector,
  SourceCodeService,
} from '@l2beat/discovery'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import { DiscoveryController } from '../api/controllers/discovery/DiscoveryController'
import { createDiscoveryRouter } from '../api/routes/discovery'
import { Config } from '../config'
import { AvailableConfigs, EthereumLikeDiscoveryConfig } from '../config/Config'
import { BlockNumberIndexer } from '../indexers/BlockNumberIndexer'
import { ClockIndexer } from '../indexers/ClockIndexer'
import { DiscoveryIndexer } from '../indexers/DiscoveryIndexer'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

interface DiscoverySubmoduleDependencies {
  logger: Logger
  config: EthereumLikeDiscoveryConfig
  repositories: {
    blockNumber: BlockNumberRepository
    indexerState: IndexerStateRepository
    discovery: DiscoveryRepository
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
  const discoverRepository = new DiscoveryRepository(database, logger)

  const clockIndexer = new ClockIndexer(
    logger,
    config.discovery.clock.tickIntervalMs,
  )

  const availableChainConfigs = Object.keys(
    config.discovery.modules,
  ) as AvailableConfigs[]

  const modules = availableChainConfigs.flatMap((chainName) => {
    const moduleConfig = config.discovery.modules[chainName]

    // Might be disabled
    if (!moduleConfig) {
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
        },
        config: moduleConfig,
      },
      chainName,
    )
  })

  const discoveryController = new DiscoveryController(discoverRepository)
  const discoveryRouter = createDiscoveryRouter(discoveryController)

  return {
    routers: [discoveryRouter],
    start: async () => {
      statusLogger.info('Starting discovery module')

      await clockIndexer.start()

      for (const module of modules) {
        await module.start?.()
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
): ApplicationModule {
  const chainId = ChainId.fromName(chain)

  const provider = new providers.StaticJsonRpcProvider(config.rpcUrl)
  const blockchainClient = new BlockchainClient(provider, logger)

  const discoveryEngine = createDiscoveryEngine(provider, config)

  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    repositories.blockNumber,
    repositories.indexerState,
    config.startBlock,
    chainId,
    clockIndexer,
    logger,
  )

  const discoveryIndexer = new DiscoveryIndexer(
    discoveryEngine,
    config.discovery,
    repositories.blockNumber,
    repositories.discovery,
    repositories.indexerState,
    chainId,
    logger,
    blockNumberIndexer,
  )

  return {
    start: async () => {
      const statusLogger = logger.for('DiscoveryModule').tag(chain)
      statusLogger.info(`Starting discovery submodule`)

      await blockNumberIndexer.start()
      await discoveryIndexer.start()

      statusLogger.info(`Discovery submodule  started`)
    },
  }
}

function createDiscoveryEngine(
  provider: providers.Provider,
  config: EthereumLikeDiscoveryConfig,
): DiscoveryEngine {
  const httpClient = new HttpClient()

  const discoveryClient = new EtherscanLikeClient(
    httpClient,
    config.blockExplorerApiUrl,
    config.blockExplorerApiKey,
    config.blockExplorerMinTimestamp,
  )

  const discoveryProvider = new DiscoveryProvider(provider, discoveryClient)
  const discoveryLogger = DiscoveryLogger.SILENT

  const proxyDetector = new ProxyDetector(discoveryProvider, discoveryLogger)
  const sourceCodeService = new SourceCodeService(discoveryProvider)
  const handlerExecutor = new HandlerExecutor(
    discoveryProvider,
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
