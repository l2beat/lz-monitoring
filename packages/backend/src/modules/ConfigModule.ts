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

  const availableChains: ChainModuleConfig[] = chains.map((chainName) => {
    const moduleConfig = config.discovery.modules[chainName]
    const chainId = ChainId.fromName(chainName)

    const isEnabled = Boolean(moduleConfig)
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    const isVisible = Boolean(moduleConfig && moduleConfig.visible)

    return {
      chainId,
      enabled: isEnabled,
      visible: isVisible,
    }
  })

  const configController = new ConfigController(availableChains)

  const statusRouter = createConfigRouter(configController)

  return {
    routers: [statusRouter],
  }
}
