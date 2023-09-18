import { Env } from '@l2beat/backend-tools'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'

import { Config } from './Config'
import { discoveryConfig } from './discoveryConfig'
import { getGitCommitSha } from './getGitCommitSha'

export function getProductionConfig(env: Env): Config {
  return {
    name: 'LZMonitoring/Production',
    logger: {
      logLevel: 'INFO',
      format: 'json',
      utc: true,
    },
    database: {
      freshStart: false,
      connection: {
        connectionString: env.string('DATABASE_URL'),
        ssl: { rejectUnauthorized: false },
      },
    },
    api: {
      port: env.integer('PORT', 3000),
    },
    health: {
      startedAt: new Date().toISOString(),
      commitSha: getGitCommitSha(),
    },
    ethereumDiscovery: {
      // This is an arbitrary number so we do not start too far in the past.
      startBlock: env.integer('START_BLOCK', 18127698),
      clockIntervalMs: env.integer('CLOCK_INTERVAL_MS', 10 * 1000),
      rpcUrl: env.string('ETHEREUM_RPC_URL'),
      etherscanApiUrl: 'https://api.etherscan.io/api',
      etherscanApiKey: env.string('ETHERSCAN_API_KEY'),
      etherscanMinTimestamp: new UnixTime(
        env.integer('ETHERSCAN_MIN_TIMESTAMP', 0),
      ),
      discovery: discoveryConfig,
    },
  }
}
