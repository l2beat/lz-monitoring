import { Logger } from '@l2beat/backend-tools'
import { providers } from 'ethers'

import { BlockNumberIndexer } from '../indexers/BlockNumberIndexer'
import { ClockIndexer } from '../indexers/ClockIndexer'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

export function createEthereumDiscoveryModule(
  database: Database,
  logger: Logger,
): ApplicationModule {
  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)

  const provider = new providers.JsonRpcProvider(
    'https://eth-mainnet.g.alchemy.com/v2/CLeXrqsc9lGb40KK9gRIbhQKGiakgp-S',
  )
  const blockchainClient = new BlockchainClient(provider, logger)

  const clockIndexer = new ClockIndexer(logger, 10 * 1000)
  const blockNumberIndexer = new BlockNumberIndexer(
    blockchainClient,
    blockRepository,
    indexerRepository,
    18127698,
    clockIndexer,
    logger,
  )

  return {
    routers: [],
    start: async () => {
      await clockIndexer.start()
      await blockNumberIndexer.start()
    },
  }
}
