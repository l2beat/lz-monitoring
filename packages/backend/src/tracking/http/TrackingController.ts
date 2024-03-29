import { assert } from '@l2beat/backend-tools'
import { DiscoveryOutput } from '@l2beat/discovery-types'
import {
  AddressInfo,
  ChainId,
  OAppsResponse,
  OAppWithConfigs,
  ResolvedConfigurationWithAppId,
} from '@lz/libs'

import { CurrentDiscoveryRepository } from '../../peripherals/database/CurrentDiscoveryRepository'
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
    private readonly currDiscoveryRepository: CurrentDiscoveryRepository,
  ) {}

  async getOApps(chainId: ChainId): Promise<OAppsResponse | null> {
    const discovery = await this.currDiscoveryRepository.find(chainId)

    if (!discovery) {
      return null
    }

    const addressInfo = outputToAddressInfo(discovery.discoveryOutput)

    const defaultConfigurations =
      await this.oAppDefaultConfigRepo.getBySourceChain(chainId)

    if (defaultConfigurations.length === 0) {
      return null
    }

    const oApps = await this.oAppRepo.getBySourceChain(chainId)

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

      defaultConfigurations: defaultConfigurations.map((record) => ({
        targetChainId: record.targetChainId,
        configuration: record.configuration,
      })),

      addressInfo,
    }
  }
}

function outputToAddressInfo(output: DiscoveryOutput): AddressInfo[] {
  const { eoas, contracts } = output

  return contracts
    .map((contract) => ({
      address: contract.address,
      name: contract.name,
      verified: !contract.unverified,
    }))
    .concat(eoas.map((eoa) => ({ address: eoa, name: 'EOA', verified: true })))
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
      const result = {
        oAppId: configuration.oAppId,
        targetChainId: configuration.targetChainId,
        isDefault: true,
      } as const

      return result
    }

    return {
      oAppId: configuration.oAppId,
      targetChainId: configuration.targetChainId,
      isDefault: false,
      changedConfiguration: diffKeys.reduce<Partial<OAppConfiguration>>(
        (acc, key) => ({
          ...acc,
          [key]: configuration.configuration[key],
        }),
        {},
      ),
    } as const
  })
}
