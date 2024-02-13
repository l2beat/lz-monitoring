import { Config } from './Config'

export function getLocalConfig(): Config {
  return {
    features: {
      v2visible: true,
    },
    apiUrl: 'http://localhost:3000/',
  }
}
