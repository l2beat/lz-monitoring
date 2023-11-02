import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import type { MilestoneRow } from 'knex/types/tables'

import { MilestoneEntry } from '../../tools/changelog/types'
import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export type MilestoneRecord = MilestoneEntry

export class MilestoneRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<MilestoneRepository>>(this)
  }

  async addMany(records: MilestoneRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()
    await knex('milestone_entries').insert(rows)

    return rows.length
  }

  async getAll(): Promise<MilestoneRecord[]> {
    const knex = await this.knex()
    const rows = await knex('milestone_entries').select('*')
    return rows.map(toRecord)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('milestone_entries').delete()
  }

  async deleteAfter(blockNumber: number, chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('milestone_entries')
      .where('chain_id', Number(chainId))
      .andWhere('block_number', '>', blockNumber)
      .delete()
  }
}

function toRow(record: MilestoneRecord): MilestoneRow {
  return {
    target_name: record.targetName,
    target_address: record.targetAddress.toString(),
    chain_id: Number(record.chainId),
    block_number: record.blockNumber,
    operation: record.operation,
  }
}

function toRecord(row: MilestoneRow): MilestoneEntry {
  return {
    targetName: row.target_name,
    targetAddress: EthereumAddress(row.target_address),
    chainId: ChainId(row.chain_id),
    blockNumber: row.block_number,
    operation: row.operation,
  } as MilestoneEntry
}
