import { Env } from '@l2beat/backend-tools'

import { Config } from './Config'
import { getProductionConfig } from './config.production'

export function getStagingConfig(env: Env): Config {
  return {
    ...getProductionConfig(env),
    name: 'LZMonitoring/Staging',
  }
}
