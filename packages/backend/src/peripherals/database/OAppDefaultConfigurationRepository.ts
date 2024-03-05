import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import type { OAppDefaultConfigurationRow } from 'knex/types/tables'

import { OAppConfiguration } from '../../tracking/domain/configuration'
import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface OAppDefaultConfigurationRecord {
  protocolVersion: string
  sourceChainId: ChainId
  targetChainId: ChainId
  configuration: OAppConfiguration
}

export class OAppDefaultConfigurationRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<OAppDefaultConfigurationRepository>>(this)
  }

  public async addMany(
    records: OAppDefaultConfigurationRecord[],
  ): Promise<number> {
    const rows = records.map(toRow)
    const knex = await this.knex()

    await knex('oapp_default_configuration')
      .insert(rows)
      .onConflict(['protocol_version', 'source_chain_id', 'target_chain_id'])
      .merge()

    return rows.length
  }

  public async findAll(): Promise<OAppDefaultConfigurationRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp_default_configuration').select('*')

    return rows.map(toRecord)
  }

  public async findBySourceChain(
    sourceChainId: ChainId,
  ): Promise<OAppDefaultConfigurationRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp_default_configuration')
      .select('*')
      .where('source_chain_id', sourceChainId)

    return rows.map(toRecord)
  }
}

function toRow(
  record: OAppDefaultConfigurationRecord,
): OAppDefaultConfigurationRow {
  return {
    protocol_version: record.protocolVersion,
    source_chain_id: Number(record.sourceChainId),
    target_chain_id: Number(record.targetChainId),
    configuration: JSON.stringify(record.configuration),
  }
}

function toRecord(
  row: OAppDefaultConfigurationRow,
): OAppDefaultConfigurationRecord {
  return {
    protocolVersion: row.protocol_version,
    sourceChainId: ChainId(row.source_chain_id),
    targetChainId: ChainId(row.target_chain_id),
    configuration: OAppConfiguration.parse(row.configuration),
  }
}
