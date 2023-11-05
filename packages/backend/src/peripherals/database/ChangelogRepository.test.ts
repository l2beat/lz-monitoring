import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { ChangelogRecord, ChangelogRepository } from './ChangelogRepository'

describe(ChangelogRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new ChangelogRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  const record1: ChangelogRecord = {
    targetName: 'contract1',
    targetAddress: EthereumAddress.random(),
    chainId,
    blockNumber: 1000,
    modificationType: 'OBJECT_NEW_PROPERTY',
    parameterName: 'key1',
    parameterPath: ['key1'],
    previousValue: null,
    currentValue: 'value1',
  }

  const record2: ChangelogRecord = {
    targetName: 'contract1',
    targetAddress: EthereumAddress.random(),
    chainId,
    blockNumber: 2000,
    modificationType: 'OBJECT_NEW_PROPERTY',
    parameterName: 'key2',
    parameterPath: ['key2'],
    previousValue: null,
    currentValue: 'value2',
  }

  describe(ChangelogRepository.prototype.addMany.name, () => {
    it('adds many records', async () => {
      await repository.addMany([record1, record2])

      const actual = await repository.getAll()

      expect(actual).toEqual([record1, record2])
    })
  })

  describe(ChangelogRepository.prototype.deleteAll.name, () => {
    it('deletes all records', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAll()

      const actual = await repository.getAll()

      expect(actual).toEqual([])
    })
  })

  describe(ChangelogRepository.prototype.deleteAfter.name, () => {
    it('deletes entries after certain block', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAfter(1000, chainId)

      const actual = await repository.getAll()

      expect(actual).toEqual([record1])
    })
  })
})
