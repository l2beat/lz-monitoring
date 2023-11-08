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

  const record3 = {
    discoveryOutput: mockDiscoveryOutput(3),
    chainId,
    blockNumber: 3,
  }

  const record4 = {
    discoveryOutput: mockDiscoveryOutput(4),
    chainId,
    blockNumber: 4,
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

    await repository.deleteAfter(record.blockNumber, chainId)

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

  it('finds at or before given block number', async () => {
    await repository.add(record)
    await repository.add(record2)

    expect(
      await repository.findAtOrBefore(record.blockNumber, chainId),
    ).toEqual(record)
    expect(
      await repository.findAtOrBefore(record2.blockNumber, chainId),
    ).toEqual(record2)
    expect(
      await repository.findAtOrBefore(record2.blockNumber + 1, chainId),
    ).toEqual(record2)
  })

  it('gets sorted outputs for given range', async () => {
    // Messed-up order on purpose
    await repository.add(record3)
    await repository.add(record2)
    await repository.add(record4)
    await repository.add(record)

    const result = await repository.getSortedInRange(
      record.blockNumber,
      record3.blockNumber,
      chainId,
    )

    // first block number exclusive - last block number inclusive
    // record1 and record4 skipped since those are out of query bounds
    expect(result).toEqual([record2, record3])
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
