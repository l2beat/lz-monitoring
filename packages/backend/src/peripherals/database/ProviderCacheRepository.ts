import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { ProviderCacheRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface ProviderCacheRecord {
  key: string
  value: string
  chainId: ChainId
  blockNumber: number | null
}

export class ProviderCacheRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<ProviderCacheRepository>>(this)
  }

  async addOrUpdate(record: ProviderCacheRecord): Promise<string> {
    console.dir({ record })

    const row = toRow(record)
    const knex = await this.knex()
    await knex('provider_cache').insert(row).onConflict('key').merge()

    return row.key
  }

  async findByKey(key: string): Promise<ProviderCacheRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('provider_cache').where({ key }).first()

    if (row) {
      return toRecord(row)
    }
  }

  async getAll(): Promise<ProviderCacheRecord[]> {
    const knex = await this.knex()
    const rows = await knex('provider_cache').select('*')

    return rows.map(toRecord)
  }
  async deleteAfter(blockNumber: number, chainId: ChainId): Promise<number> {
    const knex = await this.knex()
    return knex('block_numbers')
      .where('block_number', '>', blockNumber)
      .andWhere('chain_id', Number(chainId))
      .delete()
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('provider_cache').delete()
  }
}

function toRow(record: ProviderCacheRecord): ProviderCacheRow {
  return {
    key: record.key,
    value: record.value,
    chain_id: Number(record.chainId),
    block_number: record.blockNumber,
  }
}

function toRecord(row: ProviderCacheRow): ProviderCacheRecord {
  return {
    key: row.key,
    value: row.value,
    chainId: ChainId(row.chain_id),
    blockNumber: row.block_number,
  }
}
