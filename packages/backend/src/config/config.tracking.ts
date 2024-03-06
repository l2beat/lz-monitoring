import { Env } from '@l2beat/backend-tools'
import { MulticallConfig } from '@l2beat/discovery'
import { EthereumAddress } from '@lz/libs'

import { Config, TrackingSubmoduleConfig } from './Config'
import { coreAddressesV1, ethereumMulticallConfig } from './discovery/ethereum'

export function getCommonTrackingConfig(env: Env): Config['tracking'] {
  const createTrackingConfig = configFromTemplate(env)

  return {
    ethereum: createTrackingConfig({
      chainNamePrefix: 'ETHEREUM',
      multicallConfig: ethereumMulticallConfig,
      ulnV2Address: EthereumAddress(coreAddressesV1.ultraLightNodeV2),
    }),
  }
}

function configFromTemplate(env: Env) {
  return function ({
    chainNamePrefix,
    multicallConfig,
    ulnV2Address,
  }: {
    /**
     * The prefix of the environment variables that configure the chain.
     */
    chainNamePrefix: string

    /**
     * Multicall configuration for given chain
     */
    multicallConfig: MulticallConfig

    /**
     * Address of UlnV2 on given chain
     */
    ulnV2Address: EthereumAddress
  }): TrackingSubmoduleConfig {
    const isEnabled = env.boolean(`${chainNamePrefix}_TRACKING_ENABLED`, false)

    if (!isEnabled) {
      return {
        enabled: false,
        config: null,
      }
    }

    return {
      enabled: true,
      config: {
        listApiUrl: env.string(
          `${chainNamePrefix}_TRACKING_LIST_API_URL`,
          'https://l2beat-production.herokuapp.com/api/integrations/layerzero-oapps',
        ),
        tickIntervalMs: env.integer('TRACKING_TICK_INTERVAL_MS', 60_000_000),
        rpcUrl: env.string(`${chainNamePrefix}_TRACKING_RPC_URL`),
        ulnV2Address: ulnV2Address,
        multicall: multicallConfig,
      },
    }
  }
}
