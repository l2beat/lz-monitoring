import { Logger } from '@l2beat/backend-tools'
import { Hash256, UnixTime } from '@lz/libs'
import type { BlockNumberRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface BlockNumberRecord {
  timestamp: UnixTime
  blockNumber: number
  blockHash: Hash256
}

export class BlockNumberRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<BlockNumberRepository>>(this)
  }

  async add(record: BlockNumberRecord): Promise<number> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('block_numbers').insert(row).returning('block_number')
    return row.block_number
  }

  async addMany(records: BlockNumberRecord[]): Promise<number[]> {
    const rows: BlockNumberRow[] = records.map(toRow)
    const knex = await this.knex()
    const result = await knex('block_numbers')
      .insert(rows)
      .returning('block_number')

    return result.map((x) => x.block_number)
  }

  async getAll(): Promise<BlockNumberRecord[]> {
    const knex = await this.knex()
    const rows = await knex('block_numbers').select('*')
    return rows.map(toRecord)
  }

  async getAllInRange(from: number, to: number): Promise<BlockNumberRecord[]> {
    const knex = await this.knex()
    const rows = await knex('block_numbers')
      .select('*')
      .where('block_number', '>=', from)
      .andWhere('block_number', '<=', to)
      .orderBy('block_number')
    return rows.map(toRecord)
  }

  async findLast(): Promise<BlockNumberRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('block_numbers')
      .orderBy('block_number', 'desc')
      .first()
    return row && toRecord(row)
  }

  async findByNumber(number: number): Promise<BlockNumberRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('block_numbers')
      .where('block_number', number)
      .first()
    return row && toRecord(row)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers').delete()
  }

  async deleteAfter(blockTimestamp: UnixTime): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers')
      .where('unix_timestamp', '>', blockTimestamp.toDate())
      .delete()
  }
}

function toRow(record: BlockNumberRecord): BlockNumberRow {
  return {
    block_number: record.blockNumber,
    block_hash: record.blockHash,
    unix_timestamp: record.timestamp.toDate(),
  }
}

function toRecord(row: BlockNumberRow): BlockNumberRecord {
  return {
    blockNumber: row.block_number,
    blockHash: Hash256(row.block_hash),
    timestamp: UnixTime.fromDate(row.unix_timestamp),
  }
}
