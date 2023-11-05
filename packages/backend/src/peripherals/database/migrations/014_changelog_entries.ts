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
  await knex.schema.createTable('changelog_entries', (table) => {
    table.string('target_name').notNullable()
    table.string('target_address').notNullable()
    table.integer('chain_id').notNullable()
    table.integer('block_number').notNullable()
    table.string('modification_type').notNullable()
    table.string('parameter_name').notNullable()
    table.specificType('parameter_path', 'varchar ARRAY').notNullable()
    table.text('previous_value').nullable()
    table.text('current_value').nullable()
  })

  await knex.schema.createTable('milestone_entries', (table) => {
    table.string('target_name').notNullable()
    table.string('target_address').notNullable()
    table.integer('chain_id').notNullable()
    table.integer('block_number').notNullable()
    table.string('operation').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('changelog_entries')
  await knex.schema.dropTable('milestone_entries')
}
