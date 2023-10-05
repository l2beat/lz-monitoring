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

  it('only allows single record per key and chainId', async () => {
    const record1 = mockRecord({ value: 'value1' })
    const record2 = mockRecord({ value: 'value2' })
    await repository.addOrUpdate(record1)
    await repository.addOrUpdate(record2)
    const actual = await repository.getAll()
    expect(actual).toEqual([record2])
  })

  it('finds by key and chainId', async () => {
    const records = Array.from({ length: 10 }).map((_, i) =>
      mockRecord({
        key: `key${i}`,
        value: `value${i}`,
        chainId: i % 2 === 0 ? ChainId.ETHEREUM : ChainId.OPTIMISM,
      }),
    )
    for (const record of records) {
      await repository.addOrUpdate(record)
    }
    const actual = await repository.findByKeyAndChainId(
      'key1',
      ChainId.OPTIMISM,
    )
    expect(actual).toEqual({
      key: 'key1',
      value: 'value1',
      chainId: ChainId.OPTIMISM,
    })
  })
})

function mockRecord(record?: Partial<ProviderCacheRecord>) {
  return {
    chainId: ChainId.ETHEREUM,
    key: 'key',
    value: 'value',
    ...record,
  }
}
