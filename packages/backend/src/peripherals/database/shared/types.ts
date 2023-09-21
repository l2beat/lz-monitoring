export {}
declare module 'knex/types/tables' {
  interface BlockNumberRow {
    unix_timestamp: Date
    block_number: number
    block_hash: string
    chain_id: number
  }

  interface IndexerStateRow {
    id: string
    height: number
    last_updated: Date
    chain_id: number
  }

  interface DiscoveryRow {
    chain_id: number
    discovery_json_blob: string
  }

  interface Tables {
    block_numbers: BlockNumberRow
    indexer_states: IndexerStateRow
    discovery: DiscoveryRow
  }
}
