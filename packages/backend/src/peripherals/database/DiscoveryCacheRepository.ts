import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryCacheRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface DiscoveryCacheRecord {
  key: string
  value: string
}

export class DiscoveryCacheRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap(this)
  }

  async addOrUpdate(record: DiscoveryCacheRecord): Promise<boolean> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('discovery_cache').insert(row).onConflict('key').merge()
    return true
  }

  async find(key: string): Promise<DiscoveryCacheRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('discovery_cache').where('key', key).first()
    return row && toRecord(row)
  }
}

function toRow(record: DiscoveryCacheRecord): DiscoveryCacheRow {
  return {
    key: record.key,
    value: record.value,
  }
}

function toRecord(row: DiscoveryCacheRow): DiscoveryCacheRecord {
  return {
    key: row.key,
    value: row.value,
  }
}
