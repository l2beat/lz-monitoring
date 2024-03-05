import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { OAppConfigurationRow } from 'knex/types/tables'

import { OAppConfiguration } from '../../tracking/domain/configuration'
import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface OAppConfigurationRecord {
  oAppId: number
  targetChainId: ChainId
  configuration: OAppConfiguration
}

export class OAppConfigurationRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<OAppConfigurationRepository>>(this)
  }

  public async addMany(records: OAppConfigurationRecord[]): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()

    await knex('oapp_configuration').delete()
    await knex('oapp_configuration').insert(rows)

    return rows.length
  }

  public async findAll(): Promise<OAppConfigurationRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp_configuration').select('*')

    return rows.map(toRecord)
  }
}

function toRow(record: OAppConfigurationRecord): OAppConfigurationRow {
  return {
    oapp_id: record.oAppId,
    target_chain_id: Number(record.targetChainId),
    configuration: JSON.stringify(record.configuration),
  }
}

function toRecord(row: OAppConfigurationRow): OAppConfigurationRecord {
  return {
    oAppId: row.oapp_id,
    targetChainId: ChainId(row.target_chain_id),
    configuration: OAppConfiguration.parse(row.configuration),
  }
}
