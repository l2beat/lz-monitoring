import { LoggerOptions } from '@l2beat/backend-tools'
import { Knex } from 'knex'

export interface Config {
  readonly name: string
  readonly api: ApiConfig
  readonly database: DatabaseConfig
  readonly logger: Pick<LoggerOptions, 'logLevel' | 'format'> &
    Partial<LoggerOptions>
  readonly health: HealthConfig
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
