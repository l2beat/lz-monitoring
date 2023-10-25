export {}
declare module 'knex/types/tables' {
  interface ProviderCacheRow {
    key: string
    value: string
    chain_id: number
    block_number: number | null
  }

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
    block_number: number
    discovery_json_blob: string
  }

  interface CurrentDiscoveryRow {
    chain_id: number
    discovery_json_blob: string
  }

  interface EventRow {
    chain_id: number
    block_number: number
  }

  interface Tables {
    block_numbers: BlockNumberRow
    indexer_states: IndexerStateRow
    discovery: DiscoveryRow
    current_discovery: CurrentDiscoveryRow
    provider_cache: ProviderCacheRow
    events: EventRow
  }
}
