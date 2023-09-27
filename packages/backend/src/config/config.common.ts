import { Env } from '@l2beat/backend-tools'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config } from './Config'
import { arbitrumDiscoveryConfig } from './discovery/arbitrum'
import { baseDiscoveryConfig } from './discovery/base'
import { ethereumDiscoveryConfig } from './discovery/ethereum'
import { optimismDiscoveryConfig } from './discovery/optimism'
import { polygonPosDiscoveryConfig } from './discovery/polygon-pos'
import { polygonZkEvmDiscoveryConfig } from './discovery/polygon-zkevm'

export function getCommonDiscoveryConfig(env: Env): Config['discovery'] {
  return {
    clock: {
      tickIntervalMs: env.integer('CLOCK_TICK_INTERVAL_MS', 10 * 1000),
    },
    modules: {
      ethereum: env.boolean('ETHEREUM_DISCOVERY_ENABLED', true) && {
        // This is an arbitrary number so we do not start too far in the past.
        startBlock: env.integer('ETHEREUM_START_BLOCK', 18127698),
        rpcUrl: env.string('ETHEREUM_RPC_URL'),
        blockExplorerApiUrl: 'https://api.etherscan.io/api',
        blockExplorerApiKey: env.string('ETHERSCAN_API_KEY'),
        blockExplorerMinTimestamp: new UnixTime(
          env.integer('ETHERSCAN_MIN_TIMESTAMP', 0),
        ),
        discovery: ethereumDiscoveryConfig,
      },
      arbitrum: env.boolean('ARBITRUM_DISCOVERY_ENABLED', true) && {
        startBlock: env.integer('ARBITRUM_START_BLOCK', 133212747),
        rpcUrl: env.string('ARBITRUM_RPC_URL'),
        blockExplorerApiUrl: 'https://api.arbiscan.io/api',
        blockExplorerApiKey: env.string('ARBISCAN_API_KEY'),
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            'ARBISCAN_MIN_TIMESTAMP',
            // ~ Timestamp of block number 0 on Arbitrum
            new Date('2021-05-28T22:15:00Z').getTime() / 1000,
          ),
        ),
        discovery: arbitrumDiscoveryConfig,
      },
      optimism: env.boolean('OPTIMISM_DISCOVERY_ENABLED', true) && {
        startBlock: env.integer('OPTIMISM_START_BLOCK', 109983712),
        rpcUrl: env.string('OPTIMISM_RPC_URL'),
        blockExplorerApiUrl: 'https://api-optimistic.etherscan.io/api',
        blockExplorerApiKey: env.string('OPTIMISTIC_ETHERSCAN_API_KEY'),
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            'OPTIMISTIC_ETHERSCAN_MIN_TIMESTAMP',
            // ~ Timestamp of block number 0 on Optimism
            new Date('2021-01-14T15:52:00Z').getTime() / 1000,
          ),
        ),
        discovery: optimismDiscoveryConfig,
      },

      'polygon-pos': env.boolean('POLYGON_POS_DISCOVERY_ENABLED', false) && {
        startBlock: env.integer('POLYGON_POS_START_BLOCK', 48049992),
        rpcUrl: env.string('POLYGON_POS_RPC_URL'),
        blockExplorerApiUrl: 'https://api.polygonscan.com/api',
        blockExplorerApiKey: env.string('POLYGONSCAN_POS_API_KEY'),
        // ~ Timestamp of block number 0 on Polygon-PoS
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            'POLYGONSCAN_POS_MIN_TIMESTAMP',
            new Date('2020-05-30T07:48:00Z').getTime() / 1000,
          ),
        ),
        discovery: polygonPosDiscoveryConfig,
      },
      base: env.boolean('BASE_DISCOVERY_ENABLED', false) && {
        startBlock: env.integer('BASE_START_BLOCK', 4526481),
        rpcUrl: env.string('BASE_RPC_URL'),
        blockExplorerApiUrl: 'https://api.basescan.org/api',
        blockExplorerApiKey: env.string('BASESCAN_API_KEY'),
        // ~ Timestamp of block number 0 on Base
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            'BASESCAN_MIN_TIMESTAMP',
            new Date('2023-06-15T12:36:00Z').getTime() / 1000,
          ),
        ),
        discovery: baseDiscoveryConfig,
      },
      'polygon-zkevm': env.boolean(
        'POLYGON_ZKEVM_DISCOVERY_ENABLED',
        false,
      ) && {
        startBlock: env.integer('POLYGON_ZKEVM_START_BLOCK', 5793888),
        rpcUrl: env.string('POLYGON_ZKEVM_RPC_URL'),
        blockExplorerApiUrl: 'https://api-zkevm.polygonscan.com/api',
        blockExplorerApiKey: env.string('POLYGONSCAN_ZKEVM_API_KEY'),
        // ~ Timestamp of block number 0 on Polygon-ZK-EVM
        blockExplorerMinTimestamp: new UnixTime(
          env.integer(
            'POLYGONSCAN_ZKEVM_MIN_TIMESTAMP',
            new Date('2023-06-15T12:36:00Z').getTime() / 1000,
          ),
        ),
        discovery: polygonZkEvmDiscoveryConfig,
      },
    },
  }
}
