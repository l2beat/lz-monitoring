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
 * @notice Minimal cache wipe
 * Only getTransaction entries will be pruned, but we only have a few of those.
 * 73 to be exact at the time of writing.
 */
export async function up(knex: Knex): Promise<void> {
  await knex('provider_cache').where('key', 'like', '%getTransaction%').delete()

  await knex.schema.alterTable('provider_cache', (table) => {
    table.integer('block_number').notNullable().alter()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('provider_cache', (table) => {
    table.integer('block_number').nullable().alter()
  })
}
