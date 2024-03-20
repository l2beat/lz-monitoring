import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { OAppRemoteRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface OAppRemoteRecord {
  oAppId: number
  targetChainId: ChainId
}

export class OAppRemoteRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<OAppRemoteRepository>>(this)
  }

  public async addMany(records: OAppRemoteRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()

    await knex('oapp_remote')
      .insert(rows)
      .onConflict(['oapp_id', 'target_chain_id'])
      .merge()

    return rows.length
  }

  public async findAll(): Promise<OAppRemoteRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp_remote').select('*')

    return rows.map(toRecord)
  }

  async deleteAll(): Promise<number> {
    const knex = await this.knex()
    return knex('oapp_remote').delete()
  }
}

function toRow(record: OAppRemoteRecord): OAppRemoteRow {
  return {
    oapp_id: record.oAppId,
    target_chain_id: Number(record.targetChainId),
  }
}

function toRecord(row: OAppRemoteRow): OAppRemoteRecord {
  return {
    oAppId: row.oapp_id,
    targetChainId: ChainId(row.target_chain_id),
  }
}
