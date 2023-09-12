export {}
declare module 'knex/types/tables' {
  interface BlockNumberRow {
    unix_timestamp: Date
    block_number: number
  }

  interface Tables {
    block_numbers: BlockNumberRow
  }
}
