import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@l2beat/discovery'
import { Hash256 } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { EventRepository } from './EventRepository'

describe(EventRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new EventRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  it('adds single record and queries it', async () => {
    const record = {
      blockNumber: 1,
      txHash: Hash256.random(),
      chainId,
    }
    await repository.addMany([record])
    const actual = await repository.getAll()
    expect(actual).toEqual([record])
  })

  it('gets records in range, sorted', async () => {
    const records = Array.from({ length: 10 }, (_, i) => i * 2).map(
      (blockNumber) => ({
        blockNumber,
        chainId,
        txHash: Hash256FromNumber(blockNumber),
      }),
    )
    await repository.addMany(records)
    await repository.addMany([
      {
        blockNumber: 5,
        txHash: Hash256FromNumber(5),
        chainId,
      },
    ])
    const actual = await repository.getSortedBlockNumbersInRange(2, 6, chainId)
    expect(actual).toEqual([4, 5, 6])
  })

  it('getSortedBlockNumbersInRange ignores multiple records with the same block number', async () => {
    const records = [
      {
        blockNumber: 1,
        txHash: Hash256.random(),
        chainId,
      },
      {
        blockNumber: 1,
        txHash: Hash256.random(),
        chainId,
      },
    ]
    await repository.addMany(records)
    const actual = await repository.getSortedBlockNumbersInRange(0, 1, chainId)
    expect(actual).toEqual([1])
  })

  it('delete all records', async () => {
    const records = Array.from({ length: 10 }, (_, i) => i * 2).map(
      (blockNumber) => ({
        blockNumber,
        chainId,
        txHash: Hash256.random(),
      }),
    )
    await repository.addMany(records)
    await repository.deleteAll()
    const actual = await repository.getAll()
    expect(actual).toEqual([])
  })

  it(EventRepository.prototype.deleteAfter.name, async () => {
    const records = Array.from({ length: 10 }, (_, i) => i * 2).map(
      (blockNumber) => ({
        blockNumber,
        chainId,
        txHash: Hash256FromNumber(blockNumber),
      }),
    )
    await repository.addMany(records)
    await repository.deleteAfter(2, chainId)
    const actual = await repository.getAll()
    expect(actual).toEqual([
      {
        blockNumber: 0,
        txHash: Hash256FromNumber(0),
        chainId,
      },
      {
        blockNumber: 2,
        txHash: Hash256FromNumber(2),
        chainId,
      },
    ])
  })
})

function Hash256FromNumber(number: number): Hash256 {
  return Hash256('0x' + number.toString(16).padStart(2, '0').repeat(32))
}
