export {}
declare module 'knex/types/tables' {
  interface BlockNumberRow {
    unix_timestamp: Date
    block_number: number
  }

  interface IndexerStateRow {
    id: string
    height: number
    last_updated: Date
  }

  interface DiscoveryRow {
    one_row_id: true
    discovery_json_blob: string
  }

  interface Tables {
    block_numbers: BlockNumberRow
    indexer_states: IndexerStateRow
    discovery: DiscoveryRow
  }
}
