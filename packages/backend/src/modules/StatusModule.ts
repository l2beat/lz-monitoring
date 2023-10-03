import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import {
  ChainModuleStatus,
  StatusController,
} from '../api/controllers/StatusController'
import { createStatusRouter } from '../api/routes/status'
import { Config } from '../config'
import { AvailableConfigs } from '../config/Config'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { Database } from '../peripherals/database/shared/Database'
import { ApplicationModule } from './ApplicationModule'

interface StatusModuleDependencies {
  database: Database
  logger: Logger
  config: Config
}

export function createStatusModule({
  database,
  logger,
  config,
}: StatusModuleDependencies): ApplicationModule {
  const chains = Object.keys(config.discovery.modules) as AvailableConfigs[]

  const blockRepository = new BlockNumberRepository(database, logger)
  const indexerRepository = new IndexerStateRepository(database, logger)
  const discoverRepository = new DiscoveryRepository(database, logger)

  const chainModuleStatuses: ChainModuleStatus[] = chains.map((chainName) => {
    const moduleConfig = config.discovery.modules[chainName]
    const chainId = ChainId.fromName(chainName)

    if (!moduleConfig) {
      return {
        state: 'disabled',
        chainId,
      }
    }

    const provider = new providers.StaticJsonRpcProvider(
      moduleConfig.rpcUrl,
      Number(ChainId.fromName(chainName)),
    )

    return {
      state: 'enabled',
      provider,
      chainId: ChainId.fromName(chainName),
    }
  })

  const statusController = new StatusController(
    chainModuleStatuses,
    blockRepository,
    discoverRepository,
    indexerRepository,
  )

  const statusRouter = createStatusRouter(statusController)

  return {
    routers: [statusRouter],
  }
}
