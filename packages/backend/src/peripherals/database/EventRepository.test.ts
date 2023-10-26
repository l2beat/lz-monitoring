import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@l2beat/discovery'
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
      chainId,
    }
    await repository.addMany([record])
    const actual = await repository.getAll()
    expect(actual).toEqual([record])
  })

  it('gets records in range', async () => {
    const records = Array.from({ length: 10 }, (_, i) => i * 2).map(
      (blockNumber) => ({
        blockNumber,
        chainId,
      }),
    )
    await repository.addMany(records)
    const actual = await repository.getInRange(2, 6, chainId)
    expect(actual).toEqual([
      {
        blockNumber: 4,
        chainId,
      },
      {
        blockNumber: 6,
        chainId,
      },
    ])
  })

  it('delete all records', async () => {
    const records = Array.from({ length: 10 }, (_, i) => i * 2).map(
      (blockNumber) => ({
        blockNumber,
        chainId,
      }),
    )
    await repository.addMany(records)
    await repository.deleteAll()
    const actual = await repository.getAll()
    expect(actual).toEqual([])
  })
})
