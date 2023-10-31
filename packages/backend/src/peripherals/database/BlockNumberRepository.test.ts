import { Logger } from '@l2beat/backend-tools'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
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

  it('adds 1 record', async () => {
    const record = mockRecord(1)
    await repository.add(record)
    expect(await repository.getAll()).toEqual([record])
  })

  it('updates 1 record', async () => {
    const record = mockRecord(1)
    const redord2 = {
      ...record,
      blockHash: Hash256('0x' + '2'.padStart(64, '0')),
    }
    await repository.add(record)
    await repository.add(redord2)
    expect(await repository.getAll()).toEqual([redord2])
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

  it('deletes all records after a block timestamp', async () => {
    const now = UnixTime.now()
    const range = new Array(10).fill(null).map((_, i) => i + 1)
    const records = range.map((r) => mockRecord(r, now))
    await repository.addMany(records)

    await repository.deleteAfter(now.add(5, 'hours'), ChainId.ETHEREUM)

    const actual = await repository.getAll()
    expect(actual).toEqual(
      records.filter((r) => r.timestamp.lte(now.add(5, 'hours'))),
    )
  })

  it('gets by number', async () => {
    const record = mockRecord(1)

    await repository.addMany([record])

    expect(
      await repository.findByNumber(record.blockNumber, record.chainId),
    ).toEqual(record)

    expect(await repository.findByNumber(2, ChainId.ETHEREUM)).toEqual(
      undefined,
    )
  })

  it('gets last by number', async () => {
    expect(await repository.findLast(ChainId.ETHEREUM)).toEqual(undefined)

    const block = mockRecord(69420)
    await repository.addMany([block])

    expect(await repository.findLast(ChainId.ETHEREUM)).toEqual(block)

    const earlierBlock = mockRecord(69419)
    const laterBlock = mockRecord(69421)
    await repository.addMany([laterBlock, earlierBlock])

    expect(await repository.findLast(ChainId.ETHEREUM)).toEqual(laterBlock)
  })

  it('gets all blocks in range between given numbers (inclusive)', async () => {
    const range = new Array(20)
      .fill(null)
      .map((_, i) => i + 1)
      .slice(9) // 10 ... 20 inclusive

    const blocks = range.map((r) => mockRecord(r))

    await repository.addMany(blocks)

    expect(await repository.getAllInRange(13, 17)).toEqual(blocks.slice(3, 8))
  })

  it('adds multiple blocks with the same timestamp', async () => {
    const now = UnixTime.now()
    const blocks = new Array(2).fill(null).map((_, i) => mockRecord(i, now))

    await repository.addMany(blocks)

    expect(await repository.getAll()).toEqual(blocks)
  })

  it('gets blocks by timestamp', async () => {
    const now = UnixTime.now()
    const blocks = new Array(2).fill(null).map((_, i) => ({
      blockNumber: i,
      blockHash: Hash256('0x' + i.toString(16).padStart(64, '0')),
      timestamp: now,
      chainId: ChainId.ETHEREUM,
    }))

    await repository.addMany(blocks)
    const block = mockRecord(69420)
    await repository.addMany([block])

    expect(await repository.getByTimestamp(now, ChainId.ETHEREUM)).toEqual(
      blocks,
    )
  })
})

function mockRecord(blockNumber: number, now?: UnixTime): BlockNumberRecord {
  const baseNow = now ?? UnixTime.now()
  return {
    blockNumber,
    blockHash: Hash256('0x' + blockNumber.toString(16).padStart(64, '0')),
    timestamp: baseNow.add(blockNumber, 'hours'),
    chainId: ChainId.ETHEREUM,
  }
}
