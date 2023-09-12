import { Logger } from '@l2beat/backend-tools'
import { UnixTime } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from './BlockNumberRepository'

describe(BlockNumberRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new BlockNumberRepository(database, Logger.SILENT)

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  it('adds single record and queries it', async () => {
    const record: BlockNumberRecord = {
      blockNumber: 1,
      timestamp: UnixTime.now(),
    }

    await repository.addMany([record])

    const actual = await repository.getAll()

    expect(actual).toEqual([record])
  })

  it('adds 0 records', async () => {
    await repository.addMany([])
    expect(await repository.getAll()).toEqual([])
  })

  it('adds multiple records and queries them', async () => {
    const records: BlockNumberRecord[] = [
      {
        blockNumber: 1,
        timestamp: UnixTime.now().add(-2, 'hours'),
      },
      {
        blockNumber: 2,
        timestamp: UnixTime.now().add(-1, 'hours'),
      },
      {
        blockNumber: 3,
        timestamp: UnixTime.now(),
      },
    ]

    await repository.addMany(records)
    const actual = await repository.getAll()

    expect(actual).toEqual(records)
  })

  it('deletes all records', async () => {
    await repository.addMany([
      {
        blockNumber: 1,
        timestamp: UnixTime.now().add(-1, 'hours'),
      },
      {
        blockNumber: 2,
        timestamp: UnixTime.now(),
      },
    ])

    await repository.deleteAll()

    const actual = await repository.getAll()
    expect(actual).toEqual([])
  })

  it('deletes all records after a block number', async () => {
    const start = UnixTime.now()
    const range = new Array(10).fill(null).map((_, i) => i + 1)
    const records: BlockNumberRecord[] = range.map((i) => ({
      timestamp: start.add(i - range.length, 'hours'), // ascending timestamps
      blockNumber: i,
    }))
    await repository.addMany(records)

    await repository.deleteAfter(5)

    const actual = await repository.getAll()
    expect(actual).toEqual(records.filter((r) => r.blockNumber <= 5))
  })

  it('gets by number', async () => {
    const record: BlockNumberRecord = {
      blockNumber: 1,
      timestamp: UnixTime.now(),
    }

    await repository.addMany([record])

    expect(await repository.findByNumber(record.blockNumber)).toEqual(record)

    expect(await repository.findByNumber(2)).toEqual(undefined)
  })

  it('gets last by number', async () => {
    const start = UnixTime.now()
    expect(await repository.findLast()).toEqual(undefined)

    const block = { blockNumber: 11813208, timestamp: start }
    await repository.addMany([block])

    expect(await repository.findLast()).toEqual(block)

    const earlierBlock = {
      blockNumber: 11813206,
      timestamp: start.add(-1, 'hours'),
    }
    const laterBlock = {
      blockNumber: 11813209,
      timestamp: start.add(1, 'hours'),
    }
    await repository.addMany([laterBlock, earlierBlock])

    expect(await repository.findLast()).toEqual(laterBlock)
  })

  it('gets all blocks in range between given numbers (inclusive)', async () => {
    const start = UnixTime.now()
    const range = new Array(20)
      .fill(null)
      .map((_, i) => i + 1)
      .slice(9) // 10 ... 20 inclusive

    const blocks = range.map((i) => ({
      blockNumber: i,
      timestamp: start.add(i - range.length, 'hours'), // ascending timestamps
    }))

    console.dir({ blocks }, { depth: null })

    await repository.addMany(blocks)

    expect(await repository.getAllInRange(13, 17)).toEqual(blocks.slice(3, 8))
  })
})
