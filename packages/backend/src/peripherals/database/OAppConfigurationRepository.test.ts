import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import {
  OAppConfigurationRecord,
  OAppConfigurationRepository,
} from './OAppConfigurationRepository'

describe(OAppConfigurationRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new OAppConfigurationRepository(database, Logger.SILENT)

  before(async () => await repository.deleteAll())
  afterEach(async () => await repository.deleteAll())

  describe(OAppConfigurationRepository.prototype.addMany.name, () => {
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

  describe(OAppConfigurationRepository.prototype.findByOAppIds.name, () => {
    it('returns only records with matching oAppId', async () => {
      const record1 = mockRecord({
        oAppId: 1,
      })
      const record2 = mockRecord({
        oAppId: 2,
      })
      const record3 = mockRecord({
        oAppId: 3,
      })

      await repository.addMany([record1, record2, record3])

      const result = await repository.findByOAppIds([1, 2])

      expect(result.length).toEqual(2)
    })
  })
})

function mockRecord(
  overrides?: Partial<OAppConfigurationRecord>,
): OAppConfigurationRecord {
  return {
    oAppId: 1,
    targetChainId: ChainId.ETHEREUM,
    configuration: {
      inboundBlockConfirmations: 2,
      outboundBlockConfirmations: 2,
      relayer: EthereumAddress.random(),
      oracle: EthereumAddress.random(),
      outboundProofType: 2,
      inboundProofLibraryVersion: 2,
    },
    ...overrides,
  }
}
