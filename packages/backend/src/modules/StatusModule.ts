import { Logger } from '@l2beat/backend-tools'
import { RateLimitedProvider } from '@l2beat/discovery'
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
import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
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
  const currentDiscoveryRepository = new CurrentDiscoveryRepository(
    database,
    logger,
  )

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
    const rateLimitedProvider = new RateLimitedProvider(provider, 100)

    return {
      state: 'enabled',
      provider: rateLimitedProvider,
      chainId: ChainId.fromName(chainName),
    }
  })

  const statusController = new StatusController(
    chainModuleStatuses,
    blockRepository,
    currentDiscoveryRepository,
    indexerRepository,
  )

  const statusRouter = createStatusRouter(statusController)

  return {
    routers: [statusRouter],
  }
}
