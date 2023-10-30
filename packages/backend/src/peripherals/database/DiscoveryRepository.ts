import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId } from '@lz/libs'
import type { DiscoveryRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface DiscoveryRecord {
  discoveryOutput: DiscoveryOutput
  chainId: ChainId
  blockNumber: number
}

export class DiscoveryRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap(this)
  }

  async add(record: DiscoveryRecord): Promise<boolean> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('discovery').insert(row)
    return true
  }

  async findAtOrBefore(
    blockNumber: number,
    chainId: ChainId,
  ): Promise<DiscoveryRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('discovery')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '<=', blockNumber)
      .first()
    return row && toRecord(row)
  }

  async getAll(): Promise<DiscoveryRecord[]> {
    const knex = await this.knex()
    const rows = await knex('discovery').select('*')
    return rows.map(toRecord)
  }

  async deleteAfter(blockNumber: number, chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('discovery')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '>', blockNumber)
      .delete()
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('discovery').delete()
  }
}

function toRow(record: DiscoveryRecord): DiscoveryRow {
  return {
    discovery_json_blob: JSON.stringify(record.discoveryOutput),
    chain_id: Number(record.chainId),
    block_number: record.blockNumber,
  }
}

function toRecord(row: DiscoveryRow): DiscoveryRecord {
  return {
    discoveryOutput: row.discovery_json_blob as unknown as DiscoveryOutput,
    chainId: ChainId(row.chain_id),
    blockNumber: row.block_number,
  }
}
