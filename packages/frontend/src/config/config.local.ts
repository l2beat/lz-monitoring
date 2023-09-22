import { Config } from './Config'

export function getLocalConfig(): Config {
  return {
    apiUrl: 'http://localhost:3000/',
  }
}
