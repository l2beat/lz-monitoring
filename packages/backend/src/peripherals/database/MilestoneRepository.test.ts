import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { MilestoneRecord, MilestoneRepository } from './MilestoneRepository'

describe(MilestoneRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new MilestoneRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  const record1: MilestoneRecord = {
    targetName: 'contract1',
    targetAddress: EthereumAddress.random(),
    chainId,
    blockNumber: 1000,
    operation: 'CONTRACT_ADDED',
  }

  const record2: MilestoneRecord = {
    targetName: 'contract1',
    targetAddress: EthereumAddress.random(),
    chainId,
    blockNumber: 2000,
    operation: 'CONTRACT_REMOVED',
  }

  describe(MilestoneRepository.prototype.addMany.name, () => {
    it('adds many records', async () => {
      await repository.addMany([record1, record2])

      const actual = await repository.getAll()

      expect(actual).toEqual([record1, record2])
    })
  })

  describe(MilestoneRepository.prototype.deleteAll.name, () => {
    it('deletes all records', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAll()

      const actual = await repository.getAll()

      expect(actual).toEqual([])
    })
  })

  describe(MilestoneRepository.prototype.deleteAfter.name, () => {
    it('deletes entries after certain block', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAfter(1000, chainId)

      const actual = await repository.getAll()

      expect(actual).toEqual([record1])
    })
  })
})
