import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import {
  ProviderCacheRecord,
  ProviderCacheRepository,
} from './ProviderCacheRepository'

describe(ProviderCacheRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new ProviderCacheRepository(database, Logger.SILENT)

  before(async () => await repository.deleteAll())
  afterEach(async () => await repository.deleteAll())

  it('adds single record and queries it', async () => {
    const record = mockRecord()
    await repository.addOrUpdate(record)
    const actual = await repository.getAll()
    expect(actual).toEqual([record])
  })

  it('only allows single record per key and overwrites old record with fresh data', async () => {
    const record1 = mockRecord({
      value: 'value1',
      chainId: ChainId.OPTIMISM,
      blockNumber: 1_000_000,
    })
    const record2 = mockRecord({
      value: 'value2',
      chainId: ChainId.OPTIMISM,
      blockNumber: 2_000_000,
    })

    await repository.addOrUpdate(record1)
    await repository.addOrUpdate(record2)
    const actual = await repository.getAll()
    expect(actual).toEqual([record2])
  })

  it('finds by key', async () => {
    const records = Array.from({ length: 10 }).map((_, i) =>
      mockRecord({
        key: `key${i}`,
        value: `value${i}`,
      }),
    )
    for (const record of records) {
      await repository.addOrUpdate(record)
    }
    const actual = await repository.findByKey('key1')
    expect(actual).toEqual({
      key: 'key1',
      value: 'value1',
      chainId: ChainId.ETHEREUM,
      blockNumber: 1_000_000,
    })
  })

  it('deletes only after certain point', async () => {
    const baseBlock = 1_000_000

    const allRecords = Array.from({ length: 10 }).map((_, i) => {
      const id = i + 1
      return mockRecord({
        key: `key${id}`,
        value: `value${id}`,
        blockNumber: id * baseBlock,
      })
    })

    const point = 5
    const recordUpTo = allRecords[point]!

    // exclusive
    const recordsToStay = allRecords.slice(0, point + 1)

    for (const record of allRecords) {
      await repository.addOrUpdate(record)
    }

    const beforeDelete = await repository.getAll()

    await repository.deleteAfter(recordUpTo.blockNumber, ChainId.ETHEREUM)

    const afterDelete = await repository.getAll()

    expect(beforeDelete).toEqual(allRecords)
    expect(afterDelete).toEqual(recordsToStay)
    // exclusive
    expect(afterDelete.length).toEqual(allRecords.length - point + 1)
  })
})

function mockRecord(record?: Partial<ProviderCacheRecord>) {
  return {
    key: 'key',
    value: 'value',
    chainId: ChainId.ETHEREUM,
    blockNumber: 1_000_000,
    ...record,
  }
}
