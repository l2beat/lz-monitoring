import { LoggerOptions } from '@l2beat/backend-tools'
import { DiscoveryConfig, MulticallConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { EtherscanUnsupportedMethods } from '@l2beat/discovery/dist/utils/EtherscanLikeClient'
// eslint-disable-next-line import/no-internal-modules
import { UnixTime } from '@l2beat/discovery/dist/utils/UnixTime'
import { EthereumAddress } from '@lz/libs'
import { Knex } from 'knex'

import { EventsToWatchConfig } from './discoveryConfig'

export type AvailableConfigs = keyof Config['discovery']['modules']

export interface Config {
  readonly name: string
  readonly api: ApiConfig
  readonly database: DatabaseConfig
  readonly logger: Pick<LoggerOptions, 'logLevel' | 'format'> &
    Partial<LoggerOptions>
  readonly health: HealthConfig
  readonly discovery: {
    readonly checks:
      | false
      | {
          readonly statusCheckMaxDelayMs: number
          readonly statusCheckIntervalMs: number
        }
    readonly callsPerMinute: number
    readonly modules: {
      readonly ethereum: DiscoverySubmoduleConfig
      readonly arbitrum: DiscoverySubmoduleConfig
      readonly optimism: DiscoverySubmoduleConfig
      readonly 'polygon-pos': DiscoverySubmoduleConfig
      readonly base: DiscoverySubmoduleConfig
      readonly 'polygon-zkevm': DiscoverySubmoduleConfig
      readonly bsc: DiscoverySubmoduleConfig
      readonly avalanche: DiscoverySubmoduleConfig
      readonly celo: DiscoverySubmoduleConfig
      readonly linea: DiscoverySubmoduleConfig
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

export type DiscoverySubmoduleConfig =
  | {
      visible: boolean
      enabled: true
      config: EthereumLikeDiscoveryConfig
    }
  | {
      visible: boolean
      enabled: false
      config: null
    }

export interface EthereumLikeDiscoveryConfig {
  startBlock: number
  rpcUrl: string
  rpcLogsMaxRange: number
  eventIndexerAmtBatches?: number
  blockExplorerApiUrl: string
  blockExplorerApiKey: string
  blockExplorerMinTimestamp: UnixTime
  discovery: DiscoveryConfig
  events: EventsToWatchConfig
  changelogWhitelist: EthereumAddress[]
  multicall: MulticallConfig
  tickIntervalMs: number
  loggerEnabled?: boolean
  unsupportedEtherscanMethods?: EtherscanUnsupportedMethods
}
