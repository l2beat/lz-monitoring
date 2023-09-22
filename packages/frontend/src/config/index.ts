import { Config } from './Config'
import { getLocalConfig } from './config.local'
import { getStagingConfig } from './config.staging'

export const config = getConfig(import.meta.env.MODE)

function getConfig(env: string): Config {
  switch (env) {
    case 'development':
      return getLocalConfig()
    case 'staging':
    case 'production':
      return getStagingConfig()
  }
  throw new TypeError(`Unrecognized env: ${env}!`)
}
