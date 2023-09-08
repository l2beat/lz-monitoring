import { Env, LoggerOptions } from '@l2beat/backend-tools'

import { Config } from './Config'
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
  }
}
