import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { Hash256 } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { DiscoveryRepository } from './DiscoveryRepository'

describe(DiscoveryRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new DiscoveryRepository(database, Logger.SILENT)

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  const record = {
    discoveryOutput: mockDiscoveryOutput(1),
  }

  const record2 = {
    discoveryOutput: mockDiscoveryOutput(2),
  }

  it('adds single record and queries it', async () => {
    await repository.addOrUpdate(record)

    const actual = await repository.find()

    expect(actual).toEqual(record)
  })

  it('updates existing record', async () => {
    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.find()

    expect(actual).toEqual(record2)
  })

  it('delete all records', async () => {
    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    await repository.deleteAll()

    const actual = await repository.find()

    expect(actual).toEqual(undefined)
  })

  it('returns undefined if no records', async () => {
    const actual = await repository.find()

    expect(actual).toEqual(undefined)
  })

  it('stores only one record', async () => {
    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.getAll()

    expect(actual).toEqual([record2])
  })
})

function mockDiscoveryOutput(blockNumber: number): DiscoveryOutput {
  return {
    name: 'name',
    version: 0,
    contracts: [],
    chain: 'chain',
    blockNumber,
    eoas: [],
    abis: {},
    configHash: Hash256.random(),
  }
}
