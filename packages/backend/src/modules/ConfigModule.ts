import { ChainId, ChainModuleConfig } from '@lz/libs'

import { ConfigController } from '../api/controllers/config/ConfigController'
import { createConfigRouter } from '../api/routes/config'
import { Config } from '../config'
import { AvailableConfigs } from '../config/Config'
import { ApplicationModule } from './ApplicationModule'

interface ConfigModuleDependencies {
  config: Config
}

export function createConfigModule({
  config,
}: ConfigModuleDependencies): ApplicationModule {
  const chains = Object.keys(config.discovery.modules) as AvailableConfigs[]

  // FIXME: module config is not the best naming here, more something like flag
  const availableChains: ChainModuleConfig[] = chains.map((chainName) => {
    const moduleConfig = config.discovery.modules[chainName]
    const chainId = ChainId.fromName(chainName)

    return {
      chainId,
      enabled: Boolean(moduleConfig),
    }
  })

  const configController = new ConfigController(availableChains)

  const statusRouter = createConfigRouter(configController)

  return {
    routers: [statusRouter],
  }
}
