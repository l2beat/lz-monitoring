import { assert } from '@l2beat/backend-tools'
import {
  ChainId,
  OAppsResponse,
  OAppWithConfigs,
  ResolvedConfigurationWithAppId,
} from '@lz/libs'

import {
  OAppConfigurationRecord,
  OAppConfigurationRepository,
} from '../../peripherals/database/OAppConfigurationRepository'
import {
  OAppDefaultConfigurationRecord,
  OAppDefaultConfigurationRepository,
} from '../../peripherals/database/OAppDefaultConfigurationRepository'
import {
  OAppRecord,
  OAppRepository,
} from '../../peripherals/database/OAppRepository'
import { OAppConfiguration } from '../domain/configuration'

export { TrackingController }

class TrackingController {
  constructor(
    private readonly oAppRepo: OAppRepository,
    private readonly oAppConfigurationRepo: OAppConfigurationRepository,
    private readonly oAppDefaultConfigRepo: OAppDefaultConfigurationRepository,
  ) {}

  async getOApps(chainId: ChainId): Promise<OAppsResponse | null> {
    const defaultConfigurations =
      await this.oAppDefaultConfigRepo.findBySourceChain(chainId)

    if (defaultConfigurations.length === 0) {
      return null
    }

    const oApps = await this.oAppRepo.findBySourceChain(chainId)

    if (oApps.length === 0) {
      return null
    }

    const configurations = await this.oAppConfigurationRepo.findByOAppIds(
      oApps.map((o) => o.id),
    )

    const resolvesConfigurations = resolveConfigurationChanges(
      configurations,
      defaultConfigurations,
    )

    const oAppsWithConfigs = attachConfigurations(oApps, resolvesConfigurations)

    return {
      sourceChainId: chainId,
      oApps: oAppsWithConfigs,
    }
  }
}

function attachConfigurations(
  oApps: OAppRecord[],
  configurations: ResolvedConfigurationWithAppId[],
): OAppWithConfigs[] {
  return oApps.map((oApp) => {
    const configs = configurations.filter((config) => config.oAppId === oApp.id)

    const configsWithoutId = configs.map(({ oAppId: _, ...rest }) => rest)

    return {
      name: oApp.name,
      symbol: oApp.symbol,
      address: oApp.address,
      iconUrl: oApp.iconUrl ? oApp.iconUrl : null,
      configurations: configsWithoutId,
    }
  })
}

function resolveConfigurationChanges(
  configurations: OAppConfigurationRecord[],
  defaults: OAppDefaultConfigurationRecord[],
): ResolvedConfigurationWithAppId[] {
  return configurations.map((configuration) => {
    const dCfg = defaults.find(
      (d) => d.targetChainId === configuration.targetChainId,
    )

    assert(
      dCfg,
      `no default configuration found for target chain: ${configuration.targetChainId.valueOf()}`,
    )

    const keys = Object.keys(dCfg.configuration) as (keyof OAppConfiguration)[]

    const diffKeys = keys.flatMap((key) => {
      if (dCfg.configuration[key] !== configuration.configuration[key]) {
        return key
      }
      return []
    })

    if (diffKeys.length === 0) {
      return {
        ...configuration,
        isDefault: true,
      } as const
    }

    return {
      ...configuration,
      isDefault: false,
      diffs: diffKeys,
    } as const
  })
}
