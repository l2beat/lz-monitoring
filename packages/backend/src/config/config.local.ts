import { Env, LoggerOptions } from '@l2beat/backend-tools'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config } from './Config'
import { arbitrumDiscoveryConfig } from './discovery/arbitrum'
import { ethereumDiscoveryConfig } from './discovery/ethereum'
import { getGitCommitSha } from './getGitCommitSha'

export function getLocalConfig(env: Env): Config {
  return {
    name: 'LZMonitoring/Local',
    logger: {
      logLevel: env.string('LOG_LEVEL', 'INFO') as LoggerOptions['logLevel'],
      format: 'pretty',
      colors: true,
    },
    database: {
      connection: env.string('LOCAL_DB_URL'),
      freshStart: env.boolean('FRESH_START', false),
    },
    api: {
      port: env.integer('PORT', 3000),
    },
    health: {
      startedAt: new Date().toISOString(),
      commitSha: getGitCommitSha(),
    },
    discovery: {
      ethereum: {
        // This is an arbitrary number so we do not start too far in the past.
        startBlock: env.integer('START_BLOCK', 18127698),
        clockIntervalMs: env.integer('CLOCK_INTERVAL_MS', 10 * 1000),
        rpcUrl: env.string('ETHEREUM_RPC_URL'),
        blockExplorerApiUrl: 'https://api.etherscan.io/api',
        blockExplorerApiKey: env.string('ETHERSCAN_API_KEY'),
        blockExplorerMinTimestamp: new UnixTime(
          env.integer('ETHERSCAN_MIN_TIMESTAMP', 0),
        ),
        discovery: ethereumDiscoveryConfig,
      },
      arbitrum: {
        startBlock: env.integer('START_BLOCK', 133212747),
        clockIntervalMs: env.integer('CLOCK_INTERVAL_MS', 10 * 1000),
        rpcUrl: env.string('ARBITRUM_RPC_URL'),
        blockExplorerApiUrl: 'https://api.arbiscan.io/api',
        blockExplorerApiKey: env.string('ARBISCAN_API_KEY'),
        // ~ Timestamp of block number 0 on Arbitrum
        blockExplorerMinTimestamp: UnixTime.fromDate(
          new Date('2021-05-28T22:15:00Z'),
        ),
        discovery: arbitrumDiscoveryConfig,
      },
    },
  }
}
