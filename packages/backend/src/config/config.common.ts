import { Env } from '@l2beat/backend-tools'
import { DiscoveryConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config, EthereumLikeDiscoveryConfig } from './Config'
import { arbitrumDiscoveryConfig } from './discovery/arbitrum'
import { baseDiscoveryConfig } from './discovery/base'
import { ethereumDiscoveryConfig } from './discovery/ethereum'
import { optimismDiscoveryConfig } from './discovery/optimism'
import { polygonPosDiscoveryConfig } from './discovery/polygon-pos'
import { polygonZkEvmDiscoveryConfig } from './discovery/polygon-zkevm'

export function getCommonDiscoveryConfig(env: Env): Config['discovery'] {
  const createConfig = configFromTemplate(env)

  return {
    clock: {
      tickIntervalMs: env.integer('CLOCK_TICK_INTERVAL_MS', 10 * 1000),
    },
    modules: {
      ethereum: createConfig({
        chainNamePrefix: 'ETHEREUM',
        startBlock: 18127698,
        blockExplorerPrefix: 'ETHERSCAN',
        blockExplorerApiUrl: 'https://api.etherscan.io/api',
        blockExplorerMinTimestamp: new Date(0),
        discoveryConfig: ethereumDiscoveryConfig,
      }),
      arbitrum: createConfig({
        chainNamePrefix: 'ARBITRUM',
        startBlock: 133212747,
        blockExplorerPrefix: 'ARBISCAN',
        blockExplorerApiUrl: 'https://api.arbiscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-05-28T22:15:00Z'),
        discoveryConfig: arbitrumDiscoveryConfig,
      }),
      optimism: createConfig({
        chainNamePrefix: 'OPTIMISM',
        startBlock: 109983712,
        blockExplorerPrefix: 'OPTIMISTIC_ETHERSCAN',
        blockExplorerApiUrl: 'https://api-optimistic.etherscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-01-14T15:52:00Z'),
        discoveryConfig: optimismDiscoveryConfig,
      }),
      'polygon-pos': createConfig({
        chainNamePrefix: 'POLYGON_POS',
        startBlock: 48049992,
        blockExplorerPrefix: 'POLYGONSCAN_POS',
        blockExplorerApiUrl: 'https://api.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2020-05-30T07:48:00Z'),
        discoveryConfig: polygonPosDiscoveryConfig,
      }),
      'polygon-zkevm': createConfig({
        chainNamePrefix: 'POLYGON_ZKEVM',
        startBlock: 5793888,
        blockExplorerPrefix: 'POLYGONSCAN_ZKEVM',
        blockExplorerApiUrl: 'https://api-zkevm.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: polygonZkEvmDiscoveryConfig,
      }),
      base: createConfig({
        chainNamePrefix: 'BASE',
        startBlock: 4526481,
        blockExplorerPrefix: 'BASESCAN',
        blockExplorerApiUrl: 'https://api.basescan.org/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: baseDiscoveryConfig,
      }),
    },
  }
}

function configFromTemplate(env: Env) {
  return function ({
    chainNamePrefix,
    startBlock,
    blockExplorerPrefix,
    blockExplorerApiUrl,
    blockExplorerMinTimestamp,
    discoveryConfig,
  }: {
    /**
     * The prefix of the environment variables that configure the chain.
     */
    chainNamePrefix: string

    /**
     * The prefix of the environment variables that configure the block explorer.
     */
    blockExplorerPrefix: string

    /**
     * The URL of the block explorer API.
     */
    blockExplorerApiUrl: string

    /**
     * The discovery configuration.
     */
    discoveryConfig: DiscoveryConfig

    /**
     * The minimum timestamp block explorer client can query
     */
    blockExplorerMinTimestamp: Date

    /**
     * The block number from which to start indexing.
     */
    startBlock: number
  }): false | EthereumLikeDiscoveryConfig {
    return (
      env.boolean(`${chainNamePrefix}_DISCOVERY_ENABLED`, false) && {
        startBlock: env.integer(`${chainNamePrefix}_START_BLOCK`, startBlock),
        rpcUrl: env.string(`${chainNamePrefix}_RPC_URL`),
        rpcLogsMaxRange: env.integer(
          `${chainNamePrefix}_RPC_LOGS_MAX_RANGE`,
          10000,
        ),
        blockExplorerApiUrl,
        blockExplorerApiKey: env.string(`${blockExplorerPrefix}_API_KEY`),
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            `${blockExplorerPrefix}_MIN_TIMESTAMP`,
            blockExplorerMinTimestamp.getTime() / 1000,
          ),
        ),
        discovery: discoveryConfig,
      }
    )
  }
}
