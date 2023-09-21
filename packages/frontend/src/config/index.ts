import { Config } from './Config'
import { getLocalConfig } from './config.local'
import { getStagingConfig } from './config.staging'

export function getConfig(env: string): Config {
  switch (env) {
    case 'local':
      return getLocalConfig()
    case 'staging':
      return getStagingConfig()
  }
  throw new TypeError(`Unrecognized env: ${env}!`)
}
