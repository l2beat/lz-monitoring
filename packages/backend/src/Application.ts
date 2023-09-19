import { Logger } from '@l2beat/backend-tools'
import { getTestnet } from '@lz/testnet'
import { providers } from 'ethers'

import { ApiServer } from './api/ApiServer'
import { Config } from './config'
import { ApplicationModule } from './modules/ApplicationModule'
import { createConfigModule } from './modules/ConfigModule'
import { createDiscoveryModule } from './modules/DiscoveryModule'
import { createHealthModule } from './modules/HealthModule'
import { createStatusModule } from './modules/StatusModule'
import { Database } from './peripherals/database/shared/Database'
import { handleServerError, reportError } from './tools/ErrorReporter'

export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const loggerOptions = { ...config.logger, reportError }

    const logger = new Logger(loggerOptions)

    const database = new Database(config.database.connection, logger)

    const modules: (ApplicationModule | undefined)[] = [
      createHealthModule(config),
      createDiscoveryModule({ database, logger, config }),
      createStatusModule({ database, logger, config }),
      createConfigModule({ config }),
    ]

    const apiServer = new ApiServer(
      config.api.port,
      logger,
      modules.flatMap((x) => x?.routers ?? []),
      handleServerError,
    )

    this.start = async () => {
      if (config.database.freshStart) {
        await database.rollbackAll()
      }
      await database.migrateToLatest()

      for (const module of modules) {
        await module?.start?.()
      }

      await apiServer.listen()

      const testnet = getTestnet(logger)({
        port: 3002,
        logging: { quiet: true },
      })
      await testnet.boot()
      const provider = new providers.JsonRpcProvider('http://localhost:3002')

      const block1 = await provider.getBlock('latest')
      logger.info('Got block from ganache', { block1 })

      await testnet.mine({ blocks: 10 })

      const block2 = await provider.getBlock('latest')
      logger.info('Got block from ganache', { block2 })

      await testnet.destroy()
    }
  }
}
