import { Logger } from '@l2beat/backend-tools'
import { Hash256, UnixTime } from '@lz/libs'
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
    const record = mockRecord(1)

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
      mockRecord(1),
      mockRecord(2),
      mockRecord(3),
    ]

    await repository.addMany(records)
    const actual = await repository.getAll()

    expect(actual).toEqual(records)
  })

  it('deletes all records', async () => {
    await repository.addMany([mockRecord(1), mockRecord(2)])

    await repository.deleteAll()

    const actual = await repository.getAll()
    expect(actual).toEqual([])
  })

  it('deletes all records after a block number', async () => {
    const range = new Array(10).fill(null).map((_, i) => i + 1)
    const records = range.map(mockRecord)
    await repository.addMany(records)

    await repository.deleteAfter(5)

    const actual = await repository.getAll()
    expect(actual).toEqual(records.filter((r) => r.blockNumber <= 5))
  })

  it('gets by number', async () => {
    const record = mockRecord(1)

    await repository.addMany([record])

    expect(await repository.findByNumber(record.blockNumber)).toEqual(record)

    expect(await repository.findByNumber(2)).toEqual(undefined)
  })

  it('gets last by number', async () => {
    expect(await repository.findLast()).toEqual(undefined)

    const block = mockRecord(69420)
    await repository.addMany([block])

    expect(await repository.findLast()).toEqual(block)

    const earlierBlock = mockRecord(69419)
    const laterBlock = mockRecord(69421)
    await repository.addMany([laterBlock, earlierBlock])

    expect(await repository.findLast()).toEqual(laterBlock)
  })

  it('gets all blocks in range between given numbers (inclusive)', async () => {
    const range = new Array(20)
      .fill(null)
      .map((_, i) => i + 1)
      .slice(9) // 10 ... 20 inclusive

    const blocks = range.map(mockRecord)

    await repository.addMany(blocks)

    expect(await repository.getAllInRange(13, 17)).toEqual(blocks.slice(3, 8))
  })
})

function mockRecord(blockNumber: number): BlockNumberRecord {
  return {
    blockNumber,
    blockHash: Hash256('0x' + blockNumber.toString(16).padStart(64, '0')),
    timestamp: UnixTime.now().add(blockNumber, 'hours'),
  }
}
