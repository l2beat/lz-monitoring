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
  await knex.schema.createTable('oapps_tracking', (table) => {
    table.string('name').notNullable()
    table.string('address').notNullable()
    table.integer('source_chain_id').notNullable()
    table.integer('target_chain_id').notNullable()
    table.boolean('has_defaults').notNullable()

    table.primary(['name', 'address', 'source_chain_id', 'target_chain_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('oapps_tracking')
}
