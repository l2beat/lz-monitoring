import { Logger } from '@l2beat/backend-tools'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import type { BlockNumberRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface BlockNumberRecord {
  timestamp: UnixTime
  blockNumber: number
  blockHash: Hash256
  chainId: ChainId
}

export class BlockNumberRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<BlockNumberRepository>>(this)
  }

  async add(record: BlockNumberRecord): Promise<number> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('block_numbers')
      .insert(row)
      .returning('block_number')
      .onConflict(['unix_timestamp', 'chain_id'])
      .merge()

    return row.block_number
  }

  async addMany(records: BlockNumberRecord[]): Promise<number[]> {
    const rows: BlockNumberRow[] = records.map(toRow)
    const knex = await this.knex()
    const result = await knex('block_numbers')
      .insert(rows)
      .returning('block_number')
      .onConflict(['unix_timestamp', 'chain_id'])
      .merge()

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

  async findLast(chainId: ChainId): Promise<BlockNumberRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('block_numbers')
      .where({ chain_id: Number(chainId) })
      .orderBy('block_number', 'desc')
      .first()
    return row && toRecord(row)
  }

  async findAtOrBefore(
    timestamp: UnixTime,
    chainId: ChainId,
  ): Promise<number | undefined> {
    const knex = await this.knex()
    const row = await knex('block_numbers')
      .where('unix_timestamp', '<=', timestamp.toDate())
      .andWhere('chain_id', '=', Number(chainId))
      .orderBy('block_number', 'desc')
      .first()

    return row?.block_number
  }

  async findByNumber(
    number: number,
    chainId: ChainId,
  ): Promise<BlockNumberRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('block_numbers')
      .where('block_number', number)
      .andWhere('chain_id', Number(chainId))
      .first()
    return row && toRecord(row)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers').delete()
  }

  async deleteAfter(
    blockTimestamp: UnixTime,
    chainId: ChainId,
  ): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers')
      .where('unix_timestamp', '>', blockTimestamp.toDate())
      .andWhere('chain_id', Number(chainId))
      .delete()
  }
}

function toRow(record: BlockNumberRecord): BlockNumberRow {
  return {
    block_number: record.blockNumber,
    block_hash: record.blockHash.toString(),
    unix_timestamp: record.timestamp.toDate(),
    chain_id: Number(record.chainId),
  }
}

function toRecord(row: BlockNumberRow): BlockNumberRecord {
  return {
    blockNumber: row.block_number,
    blockHash: Hash256(row.block_hash),
    timestamp: UnixTime.fromDate(row.unix_timestamp),
    chainId: ChainId(row.chain_id),
  }
}
