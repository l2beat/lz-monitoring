import { Config } from './Config'

export function getStagingConfig(): Config {
  return {
    features: {
      v2visible: false,
    },
    apiUrl: 'https://lz-monitoring-7eda96cf0a1b.herokuapp.com/',
  }
}
