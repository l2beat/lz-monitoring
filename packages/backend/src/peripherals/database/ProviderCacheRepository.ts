import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { ProviderCacheRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface ProviderCacheRecord {
  key: string
  value: string
  chainId: ChainId
}

export class ProviderCacheRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<ProviderCacheRepository>>(this)
  }

  async addOrUpdate(record: ProviderCacheRecord): Promise<string> {
    const knex = await this.knex()
    const row = toRow(record)
    await knex('provider_cache')
      .insert(row)
      .onConflict(['key', 'chain_id'])
      .merge()

    return row.key
  }

  async findByKeyAndChainId(
    key: string,
    chainId: ChainId,
  ): Promise<ProviderCacheRecord | undefined> {
    const knex = await this.knex()
    const row = await knex('provider_cache')
      .where({ key, chain_id: Number(chainId) })
      .first()
    return row ? toRecord(row) : undefined
  }

  async getAll(): Promise<ProviderCacheRecord[]> {
    const knex = await this.knex()
    const rows = await knex('provider_cache').select('*')
    return rows.map(toRecord)
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
  }
}

function toRecord(row: ProviderCacheRow): ProviderCacheRecord {
  return {
    key: row.key,
    value: row.value,
    chainId: ChainId(row.chain_id),
  }
}
