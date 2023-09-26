import { LoggerOptions } from '@l2beat/backend-tools'
import { DiscoveryConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'
import { Knex } from 'knex'

export interface Config {
  readonly name: string
  readonly api: ApiConfig
  readonly database: DatabaseConfig
  readonly logger: Pick<LoggerOptions, 'logLevel' | 'format'> &
    Partial<LoggerOptions>
  readonly health: HealthConfig
  readonly discovery: {
    readonly clock: {
      readonly tickIntervalMs: number
    }
    readonly modules: {
      readonly ethereum: false | EthereumLikeDiscoveryConfig
      readonly arbitrum: false | EthereumLikeDiscoveryConfig
    }
  }
}

export interface ApiConfig {
  readonly port: number
}

export interface DatabaseConfig {
  readonly connection: Knex.Config['connection']
  readonly freshStart: boolean
}

export interface HealthConfig {
  readonly releasedAt?: string
  readonly startedAt: string
  readonly commitSha?: string
}

export interface EthereumLikeDiscoveryConfig {
  startBlock: number
  rpcUrl: string
  blockExplorerApiUrl: string
  blockExplorerApiKey: string
  blockExplorerMinTimestamp: UnixTime
  discovery: DiscoveryConfig
}
