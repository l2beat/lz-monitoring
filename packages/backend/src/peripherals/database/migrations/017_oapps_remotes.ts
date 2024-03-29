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
  await knex.schema.createTable('oapp_remote', (table) => {
    table.integer('oapp_id').notNullable()
    table.integer('target_chain_id').notNullable()
    table.unique(['oapp_id', 'target_chain_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('oapp_remote')
}
