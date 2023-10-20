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
  const discoveryRows = await knex('discovery').select('*')
  console.log(discoveryRows)
  const newDiscoveryRows = discoveryRows.map((row) => ({
    ...row,
    block_number: (
      row.discovery_json_blob as unknown as { blockNumber: number }
    ).blockNumber,
  }))

  await knex('discovery').delete()
  await knex.schema.alterTable('discovery', (table) => {
    table.dropPrimary()
    table.integer('block_number').notNullable()
    table.primary(['block_number', 'chain_id'])
  })
  if (newDiscoveryRows.length > 0) {
    await knex('discovery').insert(newDiscoveryRows)
  }

  await knex.schema.createTable('current_discovery', (table) => {
    table.integer('chain_id').primary()
    table.json('discovery_json_blob').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('current_discovery')
  await knex.schema.alterTable('discovery', (table) => {
    table.dropColumn('block_number')
  })
}
