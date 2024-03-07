import { Env } from '@l2beat/backend-tools'

import { Config } from './Config'
import { getCommonDiscoveryConfig } from './config.discovery'
import { getCommonTrackingConfig } from './config.tracking'
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
    discovery: getCommonDiscoveryConfig(env),
    tracking: getCommonTrackingConfig(env),
  }
}
