import { LoggerOptions } from '@l2beat/backend-tools'
import { DiscoveryConfig, MulticallConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'
import { Knex } from 'knex'

export type AvailableConfigs = keyof Config['discovery']['modules']

export interface Config {
  readonly name: string
  readonly api: ApiConfig
  readonly database: DatabaseConfig
  readonly logger: Pick<LoggerOptions, 'logLevel' | 'format'> &
    Partial<LoggerOptions>
  readonly health: HealthConfig
  readonly discovery: {
    readonly callsPerMinute: number
    readonly clock: {
      readonly tickIntervalMs: number
    }
    readonly modules: {
      readonly ethereum: false | EthereumLikeDiscoveryConfig
      readonly arbitrum: false | EthereumLikeDiscoveryConfig
      readonly optimism: false | EthereumLikeDiscoveryConfig
      readonly 'polygon-pos': false | EthereumLikeDiscoveryConfig
      readonly base: false | EthereumLikeDiscoveryConfig
      readonly 'polygon-zkevm': false | EthereumLikeDiscoveryConfig
      readonly bsc?: false | EthereumLikeDiscoveryConfig // No alchemy
      readonly avalanche?: false | EthereumLikeDiscoveryConfig // No alchemy
      readonly celo?: false | EthereumLikeDiscoveryConfig // No alchemy
      readonly linea?: false | EthereumLikeDiscoveryConfig // No alchemy
      readonly gnosis?: false | EthereumLikeDiscoveryConfig // No alchemy
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
  rpcLogsMaxRange: number
  blockExplorerApiUrl: string
  blockExplorerApiKey: string
  blockExplorerMinTimestamp: UnixTime
  discovery: DiscoveryConfig
  multicall: MulticallConfig
}
