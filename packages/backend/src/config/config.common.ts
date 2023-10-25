import { Env } from '@l2beat/backend-tools'
import {
  DiscoveryConfig,
  MulticallConfig,
  multicallConfig,
} from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config, EthereumLikeDiscoveryConfig } from './Config'
import { arbitrumDiscoveryConfig } from './discovery/arbitrum'
import { avalancheDiscoveryConfig } from './discovery/avalanche'
import { baseDiscoveryConfig } from './discovery/base'
import { bscDiscoveryConfig } from './discovery/bsc'
import { celoDiscoveryConfig } from './discovery/celo'
import { ethereumDiscoveryConfig } from './discovery/ethereum'
import { lineaDiscoveryConfig } from './discovery/linea'
import { optimismDiscoveryConfig } from './discovery/optimism'
import { polygonPosDiscoveryConfig } from './discovery/polygon-pos'
import { polygonZkEvmDiscoveryConfig } from './discovery/polygon-zkevm'
import { eventsToWatch } from './discoveryConfig'

export function getCommonDiscoveryConfig(env: Env): Config['discovery'] {
  const createConfig = configFromTemplate(env)

  return {
    callsPerMinute: env.integer('RPC_CALLS_PER_MINUTE', 1000),
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
        multicallConfig: multicallConfig.ethereum,
      }),
      arbitrum: createConfig({
        chainNamePrefix: 'ARBITRUM',
        startBlock: 133212747,
        blockExplorerPrefix: 'ARBISCAN',
        blockExplorerApiUrl: 'https://api.arbiscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-05-28T22:15:00Z'),
        discoveryConfig: arbitrumDiscoveryConfig,
        multicallConfig: multicallConfig.arbitrum,
      }),
      optimism: createConfig({
        chainNamePrefix: 'OPTIMISM',
        startBlock: 109983712,
        blockExplorerPrefix: 'OPTIMISTIC_ETHERSCAN',
        blockExplorerApiUrl: 'https://api-optimistic.etherscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-01-14T15:52:00Z'),
        discoveryConfig: optimismDiscoveryConfig,
        multicallConfig: multicallConfig.optimism,
      }),
      'polygon-pos': createConfig({
        chainNamePrefix: 'POLYGON_POS',
        startBlock: 48049992,
        blockExplorerPrefix: 'POLYGONSCAN_POS',
        blockExplorerApiUrl: 'https://api.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2020-05-30T07:48:00Z'),
        discoveryConfig: polygonPosDiscoveryConfig,
        multicallConfig: multicallConfig.polygon_pos,
      }),
      'polygon-zkevm': createConfig({
        chainNamePrefix: 'POLYGON_ZKEVM',
        startBlock: 5793888,
        blockExplorerPrefix: 'POLYGONSCAN_ZKEVM',
        blockExplorerApiUrl: 'https://api-zkevm.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: polygonZkEvmDiscoveryConfig,
        multicallConfig: multicallConfig.polygon_zkevm,
      }),
      base: createConfig({
        chainNamePrefix: 'BASE',
        startBlock: 4526481,
        blockExplorerPrefix: 'BASESCAN',
        blockExplorerApiUrl: 'https://api.basescan.org/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: baseDiscoveryConfig,
        multicallConfig: multicallConfig.base,
      }),
      avalanche: createConfig({
        chainNamePrefix: 'AVALANCHE',
        startBlock: 36223765,
        blockExplorerPrefix: 'SNOWTRACE',
        blockExplorerApiUrl: 'https://api.snowtrace.io/api',
        blockExplorerMinTimestamp: new Date('2020-09-23T11:02:00Z'),
        discoveryConfig: avalancheDiscoveryConfig,
        multicallConfig: multicallConfig.avalanche,
      }),
      linea: createConfig({
        chainNamePrefix: 'LINEA',
        startBlock: 594349,
        blockExplorerPrefix: 'LINEASCAN',
        blockExplorerApiUrl: 'https://api.lineascan.build/api',
        blockExplorerMinTimestamp: new Date('2023-07-06T13:15:00Z'),
        discoveryConfig: lineaDiscoveryConfig,
        multicallConfig: multicallConfig.linea,
      }),
      bsc: createConfig({
        chainNamePrefix: 'BSC',
        startBlock: 32446967,
        blockExplorerPrefix: 'BSCSCAN',
        blockExplorerApiUrl: 'https://api.bscscan.com/api',
        blockExplorerMinTimestamp: new Date('2020-08-29T03:24:00Z'),
        discoveryConfig: bscDiscoveryConfig,
        multicallConfig: multicallConfig.bsc,
      }),
      celo: createConfig({
        chainNamePrefix: 'CELO',
        startBlock: 21836924,
        blockExplorerPrefix: 'CELOSCAN',
        blockExplorerApiUrl: 'https://api.celoscan.io/api',
        blockExplorerMinTimestamp: new Date('2020-04-22T16:00:00Z'),
        discoveryConfig: celoDiscoveryConfig,
        multicallConfig: multicallConfig.celo,
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
    multicallConfig,
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
    multicallConfig: MulticallConfig
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
        eventsToWatch,
        multicall: multicallConfig,
      }
    )
  }
}
