/*
                      ====== IMPORTANT NOTICE ======

DO NOT EDIT OR RENAME THIS FILE

This is a migration file. Once created the file should not be renamed or edited,
because migrations are only run once on the production server. 

If you find that something was incorrectly set up in the `up` function you
should create a new migration file that fixes the issue.

*/

import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  /**
   * Some of the arbitrum block numbers have the same unix timestamp.
   * This is why we need to use the block number as the primary key.
   */
  await knex.schema.alterTable('block_numbers', (table) => {
    table.dropPrimary()
    table.primary(['block_number', 'chain_id'])
    table.index(['unix_timestamp', 'chain_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('block_numbers', (table) => {
    table.dropIndex(['unix_timestamp', 'chain_id'])
    table.dropPrimary()
    table.primary(['unix_timestamp', 'chain_id'])
  })
}
