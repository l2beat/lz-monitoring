import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { ProtocolVersion } from '../../tracking/domain/const'
import { OAppRecord, OAppRepository } from './OAppRepository'

describe(OAppRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new OAppRepository(database, Logger.SILENT)

  before(async () => await repository.deleteAll())
  afterEach(async () => await repository.deleteAll())

  describe(OAppRepository.prototype.addMany.name, () => {
    it('merges rows on insert', async () => {
      const record1 = mockRecord({ id: 1, name: 'OApp1' })
      const record2 = mockRecord({ id: 2, name: 'OApp2' })

      await repository.addMany([record1, record2])

      const recordsBeforeMerge = await repository.findAll()

      await repository.addMany([record1, record2])

      const recordsAfterMerge = await repository.findAll()

      expect(recordsBeforeMerge.length).toEqual(2)
      expect(recordsAfterMerge.length).toEqual(2)
    })
  })

  describe(OAppRepository.prototype.findBySourceChain.name, () => {
    it('returns only records with matching source chain', async () => {
      const record1 = mockRecord({
        id: 1,
        name: 'OApp1',
        sourceChainId: ChainId.ETHEREUM,
      })
      const record2 = mockRecord({
        id: 2,
        name: 'OApp2',
        sourceChainId: ChainId.OPTIMISM,
      })
      const record3 = mockRecord({
        id: 3,
        name: 'OApp3',
        sourceChainId: ChainId.BSC,
      })

      await repository.addMany([record1, record2, record3])

      const result = await repository.findBySourceChain(ChainId.ETHEREUM)

      expect(result.length).toEqual(1)
    })
  })
})

function mockRecord(overrides?: Partial<OAppRecord>): Omit<OAppRecord, 'id'> {
  return {
    name: 'name',
    symbol: 'symbol',
    address: EthereumAddress.random(),
    sourceChainId: ChainId.ETHEREUM,
    protocolVersion: ProtocolVersion.V1,
    iconUrl: 'https://example.com/icon.png',
    ...overrides,
  }
}
