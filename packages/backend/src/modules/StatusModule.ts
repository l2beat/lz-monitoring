import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import { StatusController } from '../api/controllers/StatusController'
import { createStatusRouter } from '../api/routes/status'
import { Config } from '../config'
import { AvailableConfigs } from '../config/Config'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

export function createStatusModule(
  database: Database,
  logger: Logger,
  config: Config,
): ApplicationModule {
  const chains = Object.keys(config.discovery.modules) as AvailableConfigs[]

  console.dir({ chains })

  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)
  const discoverRepository = new DiscoveryRepository(database, logger)

  const enabledProviders = chains.flatMap((chainName) => {
    const moduleConfig = config.discovery.modules[chainName]

    if (!moduleConfig) {
      return []
    }

    const provider = new providers.StaticJsonRpcProvider(
      moduleConfig.rpcUrl,
      Number(ChainId.fromName(chainName)),
    )

    return {
      provider,
      chainId: ChainId.fromName(chainName),
    }
  })

  const statusController = new StatusController(
    enabledProviders,
    blockRepository,
    discoverRepository,
    indexerRepository,
  )
  const statusRouter = createStatusRouter(statusController)
  return {
    routers: [statusRouter],
  }
}
