import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress, Hash256, UnixTime } from '@lz/libs'
import type { ChangelogRow } from 'knex/types/tables'

import { ChangelogEntry } from '../../tools/changelog/types'
import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export type ChangelogRecord = ChangelogEntry

interface ChangelogSummaryRow {
  target_address: string
  unix_timestamp: Date
  count: string
}
export interface ChangelogSummaryRecord {
  address: EthereumAddress
  count: number
  lastChangeTimestamp: UnixTime
}
interface FullChangelogRow extends ChangelogRow {
  unix_timestamp: Date
  tx_hash: string
}
export interface FullChangelogRecord extends ChangelogRecord {
  timestamp: UnixTime
  txHash: Hash256
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

  async getChangesSummary(chainId: ChainId): Promise<ChangelogSummaryRecord[]> {
    const knex = await this.knex()

    const summaryRows = await knex
      .with('changes', async (qb) => {
        await qb
          .select(
            'target_address',
            knex.raw('max(block_number) as max_block'),
            // todo: we should count distinct transactions, not blocks
            knex.raw('count(distinct block_number) as count'),
          )
          .from('changelog_entries')
          .where('chain_id', chainId)
          .groupBy('target_address')
      })
      .select<ChangelogSummaryRow[]>(
        'target_address',
        'unix_timestamp',
        'count',
      )
      .from('changes')
      .join('block_numbers', 'block_numbers.block_number', 'changes.max_block')

    return summaryRows.map((row) => ({
      address: EthereumAddress(row.target_address),
      count: Number(row.count),
      lastChangeTimestamp: UnixTime.fromDate(row.unix_timestamp),
    }))
  }

  async getFullChangelog(
    chainId: ChainId,
    address: EthereumAddress,
  ): Promise<FullChangelogRecord[]> {
    const knex = await this.knex()
    const rows = await knex
      .with('changes', async (qb) => {
        await qb
          .select('c.*', 'b.unix_timestamp')
          .from('changelog_entries as c')
          .where('c.chain_id', chainId)
          .andWhere('target_address', address.toString())
          .join('block_numbers as b', 'b.block_number', 'c.block_number')
      })
      .select<FullChangelogRow[]>('e.tx_hash', 'changes.*')
      .from('changes')
      .leftJoin('events as e', 'e.block_number', 'changes.block_number')

    return rows.map((r) => ({
      ...toRecord(r),
      timestamp: UnixTime.fromDate(r.unix_timestamp),
      txHash: Hash256(r.tx_hash),
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
    modificationType: row.modification_type,
    parameterName: row.parameter_name,
    parameterPath: row.parameter_path,
    previousValue: row.previous_value,
    currentValue: row.current_value,
  } as ChangelogEntry
}
