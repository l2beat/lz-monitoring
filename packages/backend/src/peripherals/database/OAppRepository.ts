import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { OAppRow } from 'knex/types/tables'

import { BaseRepository, CheckConvention } from './shared/BaseRepository'
import { Database } from './shared/Database'

export interface OAppRecord {
  id: number
  name: string
  protocolVersion: string
  address: EthereumAddress
  sourceChainId: ChainId
  iconUrl: string
}

export class OAppRepository extends BaseRepository {
  constructor(database: Database, logger: Logger) {
    super(database, logger)
    this.autoWrap<CheckConvention<OAppRepository>>(this)
  }

  public async addMany(records: Omit<OAppRecord, 'id'>[]): Promise<number[]> {
    const rows = records.map(toRow)

    const knex = await this.knex()

    const ids = await knex('oapp')
      .insert(rows)
      .onConflict(['name', 'protocol_version', 'address', 'source_chain_id'])
      .merge()
      .returning('id')

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return ids.map((id) => id.id)
  }

  public async findAll(): Promise<OAppRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp').select('*')

    return rows.map(toRecord)
  }

  public async findByChain(chainId: ChainId): Promise<OAppRecord[]> {
    const knex = await this.knex()

    const rows = await knex('oapp')
      .select('*')
      .where('source_chain_id', chainId)

    return rows.map(toRecord)
  }
}

function toRecord(row: OAppRow): OAppRecord {
  return {
    id: row.id,
    name: row.name,
    protocolVersion: row.protocol_version,
    address: EthereumAddress(row.address),
    sourceChainId: ChainId(row.source_chain_id),
    iconUrl: row.icon_url,
  }
}

function toRow(record: Omit<OAppRecord, 'id'>): Omit<OAppRow, 'id'> {
  return {
    name: record.name,
    protocol_version: record.protocolVersion,
    address: record.address.toString(),
    source_chain_id: Number(record.sourceChainId),
    icon_url: record.iconUrl,
  }
}
