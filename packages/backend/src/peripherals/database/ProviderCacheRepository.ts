import { Logger } from '@l2beat/backend-tools'
import type { ProviderCacheRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export class ProviderCacheRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<ProviderCacheRepository>>(this)
  }

  async addOrUpdate(row: ProviderCacheRow): Promise<string> {
    const knex = await this.knex()
    await knex('provider_cache')
      .insert(row)
      .onConflict(['key', 'chain_id'])
      .merge()

    return row.key
  }

  async findByKey(key: string): Promise<ProviderCacheRow | undefined> {
    const knex = await this.knex()
    const row = await knex('provider_cache').where({ key }).first()
    return row
  }

  async getAll(): Promise<ProviderCacheRow[]> {
    const knex = await this.knex()
    const rows = await knex('provider_cache').select('*')
    return rows
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('provider_cache').delete()
  }
}
