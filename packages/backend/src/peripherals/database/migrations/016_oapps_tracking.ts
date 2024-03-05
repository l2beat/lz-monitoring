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
  await knex.schema.createTable('oapp', (table) => {
    table.increments('id').primary()
    table.string('protocol_version').notNullable()
    table.string('name').notNullable()
    table.string('address').notNullable()
    table.integer('source_chain_id').notNullable()
    table.string('icon_url').notNullable()

    table.unique(['name', 'protocol_version', 'address', 'source_chain_id'])
  })

  await knex.schema.createTable('oapp_configuration', (table) => {
    table.integer('oapp_id').notNullable()
    table.integer('target_chain_id').notNullable()
    table.jsonb('configuration').notNullable()

    table.unique(['oapp_id', 'target_chain_id'])
  })

  await knex.schema.createTable('oapp_default_configuration', (table) => {
    table.string('protocol_version').notNullable()
    table.integer('source_chain_id').notNullable()
    table.integer('target_chain_id').notNullable()
    table.jsonb('configuration').notNullable()

    table.unique(['protocol_version', 'source_chain_id', 'target_chain_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('oapp')
  await knex.schema.dropTable('oapp_configuration')
  await knex.schema.dropTable('oapp_default_configuration')
}
