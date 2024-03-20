import { Logger } from '@l2beat/backend-tools'
import { ChainId } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { OAppRemoteRecord, OAppRemoteRepository } from './OAppRemoteRepository'

describe(OAppRemoteRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new OAppRemoteRepository(database, Logger.SILENT)

  before(async () => await repository.deleteAll())
  afterEach(async () => await repository.deleteAll())

  describe(OAppRemoteRepository.prototype.addMany.name, () => {
    it('merges rows on insert', async () => {
      const record1 = mockRecord({ oAppId: 1, targetChainId: ChainId.ETHEREUM })
      const record2 = mockRecord({ oAppId: 2, targetChainId: ChainId.OPTIMISM })

      await repository.addMany([record1, record2])

      const recordsBeforeMerge = await repository.findAll()

      await repository.addMany([record1, record2])

      const recordsAfterMerge = await repository.findAll()

      expect(recordsBeforeMerge.length).toEqual(2)
      expect(recordsAfterMerge.length).toEqual(2)
    })
  })
})

function mockRecord(overrides?: Partial<OAppRemoteRecord>): OAppRemoteRecord {
  return {
    oAppId: 1,
    targetChainId: ChainId.ETHEREUM,
    ...overrides,
  }
}
