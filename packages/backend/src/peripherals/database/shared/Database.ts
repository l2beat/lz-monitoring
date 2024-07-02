import { Logger } from '@l2beat/backend-tools'
import KnexConstructor, { Knex } from 'knex'
import path from 'path'

import { PolyglotMigrationSource } from './PolyglotMigrationSource'

export class Database {
  private readonly knex: Knex
  private migrated = false
  private version: string | null = null
  private onMigrationsComplete: () => void = () => {}
  private readonly migrationsComplete = new Promise<void>((resolve) => {
    this.onMigrationsComplete = resolve
  })

  constructor(
    connection: Knex.Config['connection'],
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this)
    this.knex = KnexConstructor({
      client: 'pg',
      pool: {
        idleTimeoutMillis: 360 * 1000,
      },
      connection,
      migrations: {
        migrationSource: new PolyglotMigrationSource(
          path.join(__dirname, '..', 'migrations'),
        ),
      },
    })
  }

  async getKnex(trx?: Knex.Transaction): Promise<Knex | Knex.Transaction> {
    if (!this.migrated) {
      await this.migrationsComplete
    }
    return trx ?? this.knex
  }

  getStatus(): { migrated: boolean; version: string | null } {
    return { migrated: this.migrated, version: this.version }
  }

  skipMigrations(): void {
    this.onMigrationsComplete()
    this.migrated = true
  }

  async migrateToLatest(): Promise<void> {
    await this.knex.migrate.latest()
    const version = await this.knex.migrate.currentVersion()
    this.version = version
    this.onMigrationsComplete()
    this.migrated = true
    this.logger.info('Migrations completed', { version })
  }

  async rollbackAll(): Promise<void> {
    this.migrated = false
    this.version = null
    await this.knex.migrate.rollback(undefined, true)
    this.logger.info('Migrations rollback completed')
  }

  async closeConnection(): Promise<void> {
    await this.knex.destroy()
    this.logger.debug('Connection closed')
  }
}
