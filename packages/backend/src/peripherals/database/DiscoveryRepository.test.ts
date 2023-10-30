import { Logger } from '@l2beat/backend-tools'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, Hash256 } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { DiscoveryRepository } from './DiscoveryRepository'

describe(DiscoveryRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new DiscoveryRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  const record = {
    discoveryOutput: mockDiscoveryOutput(1),
    chainId,
    blockNumber: 1,
  }

  const record2 = {
    discoveryOutput: mockDiscoveryOutput(2),
    chainId,
    blockNumber: 2,
  }

  it('adds single record and queries it', async () => {
    await repository.add(record)

    const actual = await repository.findAtOrBefore(record.blockNumber, chainId)

    expect(actual).toEqual(record)
  })

  it('does not override existing records', async () => {
    await repository.add(record)
    await repository.add(record2)

    const actual = await repository.getAll()

    expect(actual).toEqual([record, record2])
  })

  it('deletes records after given block number', async () => {
    await repository.add(record)
    await repository.add(record2)

    await repository.deleteAfter(1, chainId)

    const actual = await repository.getAll()

    expect(actual).toEqual([record])
  })

  it('delete all records', async () => {
    await repository.add(record)
    await repository.add(record2)

    await repository.deleteAll()

    const actual = await repository.getAll()

    expect(actual).toEqual([])
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
