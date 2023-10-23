/*
                      ====== IMPORTANT NOTICE ======

DO NOT EDIT OR RENAME THIS FILE

This is a migration file. Once created the file should not be renamed or edited,
because migrations are only run once on the production server. 

If you find that something was incorrectly set up in the `up` function you
should create a new migration file that fixes the issue.

*/

import { Knex } from 'knex'

/**
 * @notice Cache wipe
 */
export async function up(knex: Knex): Promise<void> {
  // Wipe the table
  await knex.table('provider_cache').truncate()

  // Cache keys might be pretty long
  await knex.raw(`
    ALTER TABLE "provider_cache"
    ALTER COLUMN "key" 
    TYPE text
  `)

  await knex.schema.alterTable('provider_cache', (table) => {
    table.integer('chain_id').notNullable()
    // Can be nullable in case of i.e getTransactions which is keyed by hash
    // which in case of reorg will be discarded either way due to dangling tip
    table.integer('block_number')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('provider_cache', (table) => {
    table.dropColumn('chain_id')
    table.dropColumn('block_number')
  })
}
