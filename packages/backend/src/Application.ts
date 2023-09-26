import { Logger } from '@l2beat/backend-tools'

import { ApiServer } from './api/ApiServer'
import { Config } from './config'
import { ApplicationModule } from './modules/ApplicationModule'
import { createDiscoveryModule } from './modules/DiscoveryModule'
import { createHealthModule } from './modules/HealthModule'
import { Database } from './peripherals/database/shared/Database'

// TODO: Error reporting
export class Application {
  start: () => Promise<void>

  constructor(config: Config) {
    const loggerOptions = { ...config.logger }

    const logger = new Logger(loggerOptions)

    const database = new Database(config.database.connection, logger)

    const modules: (ApplicationModule | undefined)[] = [
      createHealthModule(config),
      createDiscoveryModule({ database, logger, config }),
    ]

    const apiServer = new ApiServer(
      config.api.port,
      logger,
      modules.flatMap((x) => x?.routers ?? []),
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
    }
  }
}
