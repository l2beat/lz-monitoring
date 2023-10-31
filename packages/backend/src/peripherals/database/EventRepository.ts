import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { EventRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface EventRecord {
  chainId: ChainId
  blockNumber: number
}

export class EventRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap(this)
  }

  async addMany(records: EventRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()
    await knex('events').insert(rows)
    return rows.length
  }

  /**
   * @param fromBlock exclusive
   * @param toBlock inclusive
   */
  async getSortedInRange(
    fromBlock: number,
    toBlock: number,
    chainId: ChainId,
  ): Promise<EventRecord[]> {
    const knex = await this.knex()
    const rows = await knex('events')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '>', fromBlock)
      .andWhere('block_number', '<=', toBlock)
      .orderBy('block_number', 'asc')

    return rows.map(toRecord)
  }

  async deleteAfter(blockNumber: number, chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('events')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '>', blockNumber)
      .delete()
  }

  async getAll(): Promise<EventRecord[]> {
    const knex = await this.knex()
    const rows = await knex('events').select('*')
    return rows.map(toRecord)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('events').delete()
  }
}

function toRow(record: EventRecord): EventRow {
  return {
    chain_id: Number(record.chainId),
    block_number: record.blockNumber,
  }
}

function toRecord(row: EventRow): EventRecord {
  return {
    chainId: ChainId(row.chain_id),
    blockNumber: row.block_number,
  }
}
