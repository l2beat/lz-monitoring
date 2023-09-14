import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import type { DiscoveryRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface DiscoveryRecord {
  discoveryOutput: DiscoveryOutput
}

export class DiscoveryRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap(this)
  }

  async addOrUpdate(record: DiscoveryRecord): Promise<boolean> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('discovery').insert(row).onConflict('one_row_id').merge()
    return true
  }

  async find(): Promise<DiscoveryRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('discovery').first()
    return row && toRecord(row)
  }

  async getAll(): Promise<DiscoveryRecord[]> {
    const knex = await this.knex()
    const rows = await knex('discovery').select('*')
    return rows.map(toRecord)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('discovery').delete()
  }
}

function toRow(record: DiscoveryRecord): DiscoveryRow {
  return {
    one_row_id: true,
    discovery_json_blob: JSON.stringify(record.discoveryOutput),
  }
}

function toRecord(row: DiscoveryRow): DiscoveryRecord {
  return {
    discoveryOutput: row.discovery_json_blob as unknown as DiscoveryOutput,
  }
}
