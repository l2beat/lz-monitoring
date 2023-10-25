import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, Hash256 } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { CurrentDiscoveryRepository } from './CurrentDiscoveryRepository'

describe(CurrentDiscoveryRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new CurrentDiscoveryRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  const record = {
    discoveryOutput: mockDiscoveryOutput(1),
    chainId,
  }

  const record2 = {
    discoveryOutput: mockDiscoveryOutput(2),
    chainId,
  }

  it('adds single record and queries it', async () => {
    await repository.addOrUpdate(record)

    const actual = await repository.find(chainId)

    expect(actual).toEqual(record)
  })

  it('updates existing record', async () => {
    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.find(chainId)

    expect(actual).toEqual(record2)
  })

  it('delete all records', async () => {
    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    await repository.deleteAll()

    const actual = await repository.find(chainId)

    expect(actual).toEqual(undefined)
  })

  it('returns undefined if no records', async () => {
    const actual = await repository.find(chainId)

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
