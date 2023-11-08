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
  await knex('events').delete()

  await knex.schema.alterTable('events', (table) => {
    table.dropPrimary()
    table.string('tx_hash').notNullable()
    table.primary(['chain_id', 'block_number', 'tx_hash'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('events', (table) => {
    table.dropPrimary()
    table.dropColumn('tx_hash')
    table.primary(['chain_id', 'block_number'])
  })
}
