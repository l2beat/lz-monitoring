export {}
declare module 'knex/types/tables' {
  interface ProviderCacheRow {
    key: string
    value: string
    chain_id: number
    block_number: number
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
    config_hash?: string
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
    tx_hash: string
  }

  interface ChangelogRow {
    target_name: string
    target_address: string
    chain_id: number
    block_number: number
    modification_type: string
    parameter_name: string
    parameter_path: string[]
    previous_value: string | null
    current_value: string | null
  }

  interface MilestoneRow {
    target_name: string
    target_address: string
    chain_id: number
    block_number: number
    operation: string
  }

  interface OAppRow {
    id: number
    protocol_version: string
    name: string
    address: string
    source_chain_id: number
    icon_url: string
  }

  interface OAppConfigurationRow {
    oapp_id: number
    target_chain_id: number
    configuration: string
  }

  interface OAppDefaultConfigurationRow {
    protocol_version: string
    source_chain_id: number
    target_chain_id: number
    configuration: string
  }

  interface Tables {
    block_numbers: BlockNumberRow
    indexer_states: IndexerStateRow
    discovery: DiscoveryRow
    current_discovery: CurrentDiscoveryRow
    provider_cache: ProviderCacheRow
    events: EventRow
    changelog: ChangelogRow
    milestones: MilestoneRow
    oapp: OAppRow
    oapp_configuration: OAppConfigurationRow
    oapp_default_configuration: OAppDefaultConfigurationRow
  }
}
