import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

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
import { createDiscoveryEngine } from './EthereumDiscoveryModule'

export function createArbitrumDiscoveryModule(
  database: Database,
  logger: Logger,
  config: Config,
): ApplicationModule {
  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)
  const discoverRepository = new DiscoveryRepository(database, logger)

  const provider = new providers.JsonRpcProvider(
    config.discovery.arbitrum.rpcUrl,
  )

  const blockchainClient = new BlockchainClient(provider, logger)
  const discoveryEngine = createDiscoveryEngine(provider, config, 'arbitrum')

  const clockIndexer = new ClockIndexer(
    logger,
    config.discovery.arbitrum.clockIntervalMs,
  )
  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    blockRepository,
    indexerRepository,
    config.discovery.arbitrum.startBlock,
    ChainId.ARBITRUM,
    clockIndexer,
    logger,
  )

  const discoveryIndexer = new DiscoveryIndexer(
    discoveryEngine,
    config.discovery.arbitrum.discovery,
    blockRepository,
    discoverRepository,
    indexerRepository,
    ChainId.ARBITRUM,
    logger,
    blockNumberIndexer,
  )

  return {
    start: async () => {
      await clockIndexer.start()
      await blockNumberIndexer.start()
      await discoveryIndexer.start()
    },
  }
}
