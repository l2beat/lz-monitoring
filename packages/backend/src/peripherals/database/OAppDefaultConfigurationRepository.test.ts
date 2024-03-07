import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { ProtocolVersion } from '../../tracking/domain/const'
import {
  OAppDefaultConfigurationRecord,
  OAppDefaultConfigurationRepository,
} from './OAppDefaultConfigurationRepository'

describe(OAppDefaultConfigurationRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new OAppDefaultConfigurationRepository(
    database,
    Logger.SILENT,
  )

  before(async () => await repository.deleteAll())
  afterEach(async () => await repository.deleteAll())

  describe(OAppDefaultConfigurationRepository.prototype.addMany.name, () => {
    it('merges rows on insert', async () => {
      const record1 = mockRecord({
        sourceChainId: ChainId.ETHEREUM,
        targetChainId: ChainId.OPTIMISM,
        protocolVersion: ProtocolVersion.V1,
      })
      const record2 = mockRecord({
        sourceChainId: ChainId.ETHEREUM,
        targetChainId: ChainId.ARBITRUM,
        protocolVersion: ProtocolVersion.V1,
      })

      await repository.addMany([record1, record2])

      const recordsBeforeMerge = await repository.findAll()

      await repository.addMany([record1, record2])

      const recordsAfterMerge = await repository.findAll()

      expect(recordsBeforeMerge.length).toEqual(2)
      expect(recordsAfterMerge.length).toEqual(2)
    })
  })

  describe(
    OAppDefaultConfigurationRepository.prototype.getBySourceChain.name,
    () => {
      it('returns only records with matching source chain', async () => {
        const record1 = mockRecord({
          sourceChainId: ChainId.ETHEREUM,
        })
        const record2 = mockRecord({
          sourceChainId: ChainId.OPTIMISM,
        })
        const record3 = mockRecord({
          sourceChainId: ChainId.BSC,
        })

        await repository.addMany([record1, record2, record3])

        const result = await repository.getBySourceChain(ChainId.ETHEREUM)

        expect(result.length).toEqual(1)
      })
    },
  )
})

function mockRecord(
  overrides?: Partial<OAppDefaultConfigurationRecord>,
): OAppDefaultConfigurationRecord {
  return {
    sourceChainId: ChainId.ETHEREUM,
    targetChainId: ChainId.ETHEREUM,
    protocolVersion: ProtocolVersion.V1,
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
