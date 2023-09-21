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
import { BlockNumberIndexer } from '../indexers/BlockNumberIndexer'
import { ClockIndexer } from '../indexers/ClockIndexer'
import { DiscoveryIndexer } from '../indexers/DiscoveryIndexer'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

export function createEthereumDiscoveryModule(
  database: Database,
  logger: Logger,
  config: Config,
): ApplicationModule {
  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)
  const discoverRepository = new DiscoveryRepository(database, logger)

  const provider = new providers.JsonRpcProvider(
    config.discovery.ethereum.rpcUrl,
  )

  const blockchainClient = new BlockchainClient(provider, logger)
  const discoveryEngine = createDiscoveryEngine(provider, config, 'ethereum')

  const clockIndexer = new ClockIndexer(
    logger,
    config.discovery.ethereum.clockIntervalMs,
  )
  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    blockRepository,
    indexerRepository,
    config.discovery.ethereum.startBlock,
    ChainId.ETHEREUM,
    clockIndexer,
    logger,
  )

  const discoveryIndexer = new DiscoveryIndexer(
    discoveryEngine,
    config.discovery.ethereum.discovery,
    blockRepository,
    discoverRepository,
    indexerRepository,
    ChainId.ETHEREUM,
    logger,
    blockNumberIndexer,
  )

  const discoveryController = new DiscoveryController(discoverRepository)
  const discoveryRouter = createDiscoveryRouter(discoveryController)

  return {
    routers: [discoveryRouter],
    start: async () => {
      await clockIndexer.start()
      await blockNumberIndexer.start()
      await discoveryIndexer.start()
    },
  }
}

export function createDiscoveryEngine(
  provider: providers.Provider,
  config: Config,
  chain: keyof Config['discovery'],
): DiscoveryEngine {
  const httpClient = new HttpClient()
  const discoveryClient = new EtherscanLikeClient(
    httpClient,
    config.discovery[chain].blockExplorerApiUrl,
    config.discovery[chain].blockExplorerApiKey,
    config.discovery[chain].blockExplorerMinTimestamp,
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
