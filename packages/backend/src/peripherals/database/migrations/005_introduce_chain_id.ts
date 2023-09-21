/*
                      ====== IMPORTANT NOTICE ======

DO NOT EDIT OR RENAME THIS FILE

This is a migration file. Once created the file should not be renamed or edited,
because migrations are only run once on the production server. 

If you find that something was incorrectly set up in the `up` function you
should create a new migration file that fixes the issue.

*/

import { Knex } from 'knex'

const ETHEREUM_CHAIN_ID = 1

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('block_numbers', (table) => {
    table.integer('chain_id').notNullable().defaultTo(ETHEREUM_CHAIN_ID)
    table.dropPrimary()
    table.primary(['unix_timestamp', 'chain_id'])
  })

  await knex.schema.alterTable('indexer_states', (table) => {
    table.integer('chain_id').notNullable().defaultTo(ETHEREUM_CHAIN_ID)
    table.dropPrimary()
    table.primary(['id', 'chain_id'])
  })

  await knex.schema.alterTable('discovery', (table) => {
    table.dropColumn('one_row_id')

    table
      .integer('chain_id')
      .notNullable()
      .defaultTo(ETHEREUM_CHAIN_ID)
      .primary() // Replace old `one_row_id` abstract constraint
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('block_numbers', (table) => {
    table.dropPrimary()
    table.dropColumn('chain_id')
    table.primary(['unix_timestamp'])
  })

  await knex.schema.alterTable('indexer_states', (table) => {
    table.dropPrimary()
    table.dropColumn('chain_id')
    table.primary(['id'])
  })

  await knex.schema.alterTable('discovery', (table) => {
    table.dropColumn('chain_id')

    table.boolean('one_row_id').primary()
  })
}
