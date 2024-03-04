import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import type { OAppTrackingRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface OAppTrackingRecord {
  name: string
  address: EthereumAddress
  sourceChainId: ChainId
  targetChainId: ChainId
  hasDefaults: boolean
}

export class OAppTrackingRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<OAppTrackingRepository>>(this)
  }

  async addMany(records: OAppTrackingRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()

    await knex.transaction(async (trx) => {
      await trx('oapps_tracking').delete()
      await trx('oapps_tracking').insert(rows)
    })

    return records.length
  }

  async getAll(): Promise<OAppTrackingRecord[]> {
    const knex = await this.knex()
    const rows = await knex('oapps_tracking').select('*')

    return rows.map(toRecord)
  }
}

function toRow(record: OAppTrackingRecord): OAppTrackingRow {
  return {
    name: record.name,
    address: record.address.toString(),
    source_chain_id: Number(record.sourceChainId),
    target_chain_id: Number(record.targetChainId),
    has_defaults: record.hasDefaults,
  }
}

function toRecord(row: OAppTrackingRow): OAppTrackingRecord {
  return {
    name: row.name,
    address: EthereumAddress(row.address),
    sourceChainId: ChainId(row.source_chain_id),
    targetChainId: ChainId(row.target_chain_id),
    hasDefaults: row.has_defaults,
  }
}
