import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { IndexerStateRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface IndexerStateRecord {
  id: string // TODO: Maybe branded string?
  height: number
  chainId: ChainId
}

export class IndexerStateRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<IndexerStateRepository>>(this)
  }

  async addOrUpdate(record: IndexerStateRecord): Promise<string> {
    const row = toRow(record)
    const knex = await this.knex()
    await knex('indexer_states')
      .insert(row)
      .onConflict(['id', 'chain_id'])
      .merge()
    return record.id
  }

  async findById(
    id: string,
    chainId: ChainId,
  ): Promise<IndexerStateRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('indexer_states')
      .where('id', id)
      .andWhere('chain_id', Number(chainId))
      .first()
    return row && toRecord(row)
  }

  async getAll(): Promise<IndexerStateRecord[]> {
    const knex = await this.knex()
    const rows = await knex('indexer_states').select('*')
    return rows.map(toRecord)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('indexer_states').delete()
  }
}

function toRow(record: IndexerStateRecord): IndexerStateRow {
  return {
    id: record.id,
    height: record.height,
    last_updated: new Date(),
    chain_id: Number(record.chainId),
  }
}

function toRecord(row: IndexerStateRow): IndexerStateRecord {
  return {
    id: row.id,
    height: row.height,
    chainId: ChainId(row.chain_id),
  }
}
