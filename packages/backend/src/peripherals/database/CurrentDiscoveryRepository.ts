import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId } from '@lz/libs'
import type { CurrentDiscoveryRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface CurrentDiscoveryRecord {
  discoveryOutput: DiscoveryOutput
  chainId: ChainId
}

export class CurrentDiscoveryRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap(this)
  }

  async addOrUpdate(record: CurrentDiscoveryRecord): Promise<boolean> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('current_discovery').insert(row).onConflict('chain_id').merge()
    return true
  }

  async find(chainId: ChainId): Promise<CurrentDiscoveryRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('current_discovery')
      .where('chain_id', Number(chainId))
      .first()
    return row && toRecord(row)
  }

  async getAll(): Promise<CurrentDiscoveryRecord[]> {
    const knex = await this.knex()
    const rows = await knex('current_discovery').select('*')
    return rows.map(toRecord)
  }

  async deleteChain(chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('current_discovery').where('chain_id', Number(chainId)).delete()
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('current_discovery').delete()
  }
}

function toRow(record: CurrentDiscoveryRecord): CurrentDiscoveryRow {
  return {
    discovery_json_blob: JSON.stringify(record.discoveryOutput),
    chain_id: Number(record.chainId),
  }
}

function toRecord(row: CurrentDiscoveryRow): CurrentDiscoveryRecord {
  return {
    discoveryOutput: row.discovery_json_blob as unknown as DiscoveryOutput,
    chainId: ChainId(row.chain_id),
  }
}
