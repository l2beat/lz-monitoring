import { Logger } from '@l2beat/backend-tools'
import {
  ChainId,
  EthereumAddress,
  Hash256,
  ModificationType,
  UnixTime,
} from '@lz/libs'
import type { ChangelogRow } from 'knex/types/tables'

import { ChangelogEntry } from '../../tools/changelog/types'
import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export type ChangelogRecord = ChangelogEntry

interface FullChangelogRow extends ChangelogRow {
  unix_timestamp: Date
  tx_hashes: string[]
}
export interface FullChangelogRecord extends ChangelogRecord {
  timestamp: UnixTime
  txHashes: Hash256[]
}

export class ChangelogRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<ChangelogRepository>>(this)
  }

  async addMany(records: ChangelogRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()
    await knex('changelog_entries').insert(rows)

    return rows.length
  }

  async getAll(): Promise<ChangelogRecord[]> {
    const knex = await this.knex()
    const rows = await knex('changelog_entries').select('*')
    return rows.map(toRecord)
  }

  async getFullChangelog(
    chainId: ChainId,
    address: EthereumAddress,
  ): Promise<FullChangelogRecord[]> {
    const knex = await this.knex()
    const rows: FullChangelogRow[] = await knex
      .with('changes', async (qb) => {
        await qb
          .select('c.*', 'b.unix_timestamp')
          .from('changelog_entries as c')
          .where('c.chain_id', chainId)
          .andWhere('target_address', address.toString())
          .join('block_numbers as b', 'b.block_number', 'c.block_number')
      })
      .select<FullChangelogRow[]>(
        knex.raw('ARRAY_AGG(e.tx_hash) AS tx_hashes'),
        'changes.*',
      )
      .from('changes')
      .leftJoin('events as e', 'e.block_number', 'changes.block_number')
      .groupBy(
        'changes.chain_id',
        'changes.block_number',
        'changes.target_address',
        'changes.target_name',
        'changes.parameter_name',
        'changes.parameter_path',
        'changes.modification_type',
        'changes.previous_value',
        'changes.current_value',
        'changes.unix_timestamp',
      )

    return rows.map((r) => ({
      ...toRecord(r),
      timestamp: UnixTime.fromDate(r.unix_timestamp),
      txHashes: r.tx_hashes.map(Hash256),
    }))
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('changelog_entries').delete()
  }

  async deleteAfter(blockNumber: number, chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('changelog_entries')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '>', blockNumber)
      .delete()
  }
}

function toRow(record: ChangelogRecord): ChangelogRow {
  return {
    target_name: record.targetName,
    target_address: record.targetAddress.toString(),
    chain_id: Number(record.chainId),
    block_number: record.blockNumber,
    modification_type: record.modificationType,
    parameter_name: record.parameterName,
    parameter_path: record.parameterPath,
    previous_value: record.previousValue,
    current_value: record.currentValue,
  }
}

function toRecord(row: ChangelogRow): ChangelogEntry {
  return {
    targetName: row.target_name,
    targetAddress: EthereumAddress(row.target_address),
    chainId: ChainId(row.chain_id),
    blockNumber: row.block_number,
    modificationType: row.modification_type as ModificationType,
    parameterName: row.parameter_name,
    parameterPath: row.parameter_path,
    previousValue: row.previous_value,
    currentValue: row.current_value,
  }
}
