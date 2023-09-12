import { Logger } from '@l2beat/backend-tools'
import { UnixTime } from '@lz/libs'
import type { BlockNumberRow } from 'knex/types/tables'

import { BaseRepository } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface BlockNumberRecord {
  timestamp: UnixTime
  blockNumber: number
}

export class BlockNumberRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)

    /* eslint-disable @typescript-eslint/unbound-method */
    this.addMany = this.wrapAddMany(this.addMany)
    this.getAll = this.wrapGet(this.getAll)
    this.getAllInRange = this.wrapGet(this.getAllInRange)
    this.findLast = this.wrapFind(this.findLast)
    this.findByNumber = this.wrapFind(this.findByNumber)
    this.deleteAll = this.wrapDelete(this.deleteAll)
    this.deleteAfter = this.wrapDelete(this.deleteAfter)
    /* eslint-enable @typescript-eslint/unbound-method */
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

  async deleteAfter(blockNumber: number): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers')
      .where('block_number', '>', blockNumber)
      .delete()
  }
}

function toRow(record: BlockNumberRecord): BlockNumberRow {
  return {
    block_number: record.blockNumber,
    unix_timestamp: record.timestamp.toDate(),
  }
}

function toRecord(row: BlockNumberRow): BlockNumberRecord {
  return {
    blockNumber: row.block_number,
    timestamp: UnixTime.fromDate(row.unix_timestamp),
  }
}
