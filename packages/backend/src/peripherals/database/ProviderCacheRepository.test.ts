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

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

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

  it('preserves nullish block number', async () => {
    const record1 = mockRecord({
      value: 'value1',
      chainId: ChainId.OPTIMISM,
      blockNumber: null,
    })

    await repository.addOrUpdate(record1)
    const actual = await repository.getAll()

    expect(actual).toEqual([record1])
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
