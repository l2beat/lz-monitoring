import { Env } from '@l2beat/backend-tools'
import {
  DiscoveryConfig,
  MulticallConfig,
  multicallConfig,
} from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config, DiscoverySubmoduleConfig } from './Config'
import {
  arbitrumDiscoveryConfig,
  arbitrumEventsToWatch,
} from './discovery/arbitrum'
import {
  avalancheDiscoveryConfig,
  avalancheEventsToWatch,
} from './discovery/avalanche'
import { baseDiscoveryConfig, baseEventsToWatch } from './discovery/base'
import { bscDiscoveryConfig, bscEventsToWatch } from './discovery/bsc'
import { celoDiscoveryConfig, celoEventsToWatch } from './discovery/celo'
import {
  ethereumDiscoveryConfig,
  ethereumEventsToWatch,
} from './discovery/ethereum'
import { lineaDiscoveryConfig, lineaEventsToWatch } from './discovery/linea'
import {
  optimismDiscoveryConfig,
  optimismEventsToWatch,
} from './discovery/optimism'
import {
  polygonPosDiscoveryConfig,
  polygonPosEventsToWatch,
} from './discovery/polygon-pos'
import {
  polygonZkEvmDiscoveryConfig,
  polygonZkEvmEventsToWatch,
} from './discovery/polygon-zkevm'
import { EventsToWatchConfig } from './discoveryConfig'

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
        /**
         * Endpoint deploy
         * @see https://etherscan.io/address/0x66a71dcef29a0ffbdbe3c6a460a3b5bc225cd675
         */
        startBlock: 14388880,
        blockExplorerPrefix: 'ETHERSCAN',
        blockExplorerApiUrl: 'https://api.etherscan.io/api',
        blockExplorerMinTimestamp: new Date(0),
        discoveryConfig: ethereumDiscoveryConfig,
        eventsToWatchConfig: ethereumEventsToWatch,
        multicallConfig: multicallConfig.ethereum,
      }),
      arbitrum: createConfig({
        chainNamePrefix: 'ARBITRUM',
        /**
         * Endpoint deploy
         * @see https://arbiscan.io/address/0x3c2269811836af69497e5f486a85d7316753cf62
         */
        startBlock: 7920157,
        blockExplorerPrefix: 'ARBISCAN',
        blockExplorerApiUrl: 'https://api.arbiscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-05-28T22:15:00Z'),
        discoveryConfig: arbitrumDiscoveryConfig,
        eventsToWatchConfig: arbitrumEventsToWatch,
        multicallConfig: multicallConfig.arbitrum,
      }),
      optimism: createConfig({
        chainNamePrefix: 'OPTIMISM',
        /**
         * Endpoint deploy
         * @see https://optimistic.etherscan.io/address/0x3c2269811836af69497e5f486a85d7316753cf62
         */
        startBlock: 4457253,
        blockExplorerPrefix: 'OPTIMISTIC_ETHERSCAN',
        blockExplorerApiUrl: 'https://api-optimistic.etherscan.io/api',
        blockExplorerMinTimestamp: new Date('2021-01-14T15:52:00Z'),
        discoveryConfig: optimismDiscoveryConfig,
        eventsToWatchConfig: optimismEventsToWatch,
        multicallConfig: multicallConfig.optimism,
      }),
      'polygon-pos': createConfig({
        /**
         * Endpoint deploy
         * @see https://polygonscan.com/address/0x3c2269811836af69497e5f486a85d7316753cf62
         */
        chainNamePrefix: 'POLYGON_POS',
        startBlock: 25956313,
        blockExplorerPrefix: 'POLYGONSCAN_POS',
        blockExplorerApiUrl: 'https://api.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2020-05-30T07:48:00Z'),
        discoveryConfig: polygonPosDiscoveryConfig,
        eventsToWatchConfig: polygonPosEventsToWatch,
        multicallConfig: multicallConfig.polygon_pos,
      }),
      'polygon-zkevm': createConfig({
        /**
         * Endpoint deploy
         * @see https://zkevm.polygonscan.com/address/0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4
         */
        chainNamePrefix: 'POLYGON_ZKEVM',
        startBlock: 5873,
        blockExplorerPrefix: 'POLYGONSCAN_ZKEVM',
        blockExplorerApiUrl: 'https://api-zkevm.polygonscan.com/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: polygonZkEvmDiscoveryConfig,
        eventsToWatchConfig: polygonZkEvmEventsToWatch,
        multicallConfig: multicallConfig.polygon_zkevm,
      }),
      base: createConfig({
        /**
         * Endpoint deploy
         * @see https://basescan.org/address/0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7
         */
        chainNamePrefix: 'BASE',
        startBlock: 1255804,
        blockExplorerPrefix: 'BASESCAN',
        blockExplorerApiUrl: 'https://api.basescan.org/api',
        blockExplorerMinTimestamp: new Date('2023-06-15T12:36:00Z'),
        discoveryConfig: baseDiscoveryConfig,
        eventsToWatchConfig: baseEventsToWatch,
        multicallConfig: multicallConfig.base,
      }),
      avalanche: createConfig({
        /**
         * Endpoint deploy
         * @see https://snowtrace.io/address/0x3c2269811836af69497E5F486A85D7316753cf62
         */
        chainNamePrefix: 'AVALANCHE',
        startBlock: 12126063,
        blockExplorerPrefix: 'SNOWTRACE',
        blockExplorerApiUrl: 'https://api.snowtrace.io/api',
        blockExplorerMinTimestamp: new Date('2020-09-23T11:02:00Z'),
        discoveryConfig: avalancheDiscoveryConfig,
        eventsToWatchConfig: avalancheEventsToWatch,
        multicallConfig: multicallConfig.avalanche,
      }),
      linea: createConfig({
        /**
         * Endpoint deploy
         * @see https://lineascan.build/address/0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7
         */
        chainNamePrefix: 'LINEA',
        startBlock: 647,
        blockExplorerPrefix: 'LINEASCAN',
        blockExplorerApiUrl: 'https://api.lineascan.build/api',
        blockExplorerMinTimestamp: new Date('2023-07-06T13:15:00Z'),
        discoveryConfig: lineaDiscoveryConfig,
        eventsToWatchConfig: lineaEventsToWatch,
        multicallConfig: multicallConfig.linea,
      }),
      bsc: createConfig({
        chainNamePrefix: 'BSC',
        /**
         * Endpoint deploy
         * @see https://bscscan.com/address/0x3c2269811836af69497e5f486a85d7316753cf62
         */
        startBlock: 16070442,
        blockExplorerPrefix: 'BSCSCAN',
        blockExplorerApiUrl: 'https://api.bscscan.com/api',
        blockExplorerMinTimestamp: new Date('2020-08-29T03:24:00Z'),
        discoveryConfig: bscDiscoveryConfig,
        eventsToWatchConfig: bscEventsToWatch,
        multicallConfig: multicallConfig.bsc,
      }),
      celo: createConfig({
        chainNamePrefix: 'CELO',
        /**
         * Endpoint deploy
         * @see https://celoscan.io/address/0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9#code
         */
        startBlock: 16179112,
        blockExplorerPrefix: 'CELOSCAN',
        blockExplorerApiUrl: 'https://api.celoscan.io/api',
        blockExplorerMinTimestamp: new Date('2020-04-22T16:00:00Z'),
        discoveryConfig: celoDiscoveryConfig,
        eventsToWatchConfig: celoEventsToWatch,
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
    eventsToWatchConfig,
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
     * Events that signify something changing
     */
    eventsToWatchConfig: EventsToWatchConfig

    /**
     * The minimum timestamp block explorer client can query
     */
    blockExplorerMinTimestamp: Date

    /**
     * The block number from which to start indexing.
     */
    startBlock: number

    /**
     * Multicall configuration for given chain
     */
    multicallConfig: MulticallConfig
  }): DiscoverySubmoduleConfig {
    const isEnabled = env.boolean(`${chainNamePrefix}_DISCOVERY_ENABLED`, false)
    const isVisible = env.boolean(`${chainNamePrefix}_VISIBLE`, false)

    if (!isEnabled) {
      return {
        visible: isVisible,
        enabled: false,
        config: null,
      }
    }

    return {
      visible: isVisible,
      enabled: true,
      config: {
        tickIntervalMs: env.integer('CLOCK_TICK_INTERVAL_MS'),
        startBlock: env.integer(`${chainNamePrefix}_START_BLOCK`, startBlock),
        rpcUrl: env.string(`${chainNamePrefix}_RPC_URL`),
        rpcLogsMaxRange: env.integer(
          `${chainNamePrefix}_RPC_LOGS_MAX_RANGE`,
          10000,
        ),
        eventIndexerAmtBatches: env.optionalInteger(
          `${chainNamePrefix}_EVENT_INDEXER_AMT_BATCHES`,
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
        eventsToWatch: eventsToWatchConfig,
        multicall: multicallConfig,
      },
    }
  }
}
