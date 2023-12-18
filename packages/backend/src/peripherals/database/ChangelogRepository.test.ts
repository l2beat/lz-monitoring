import { Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress, Hash256, UnixTime } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { BlockNumberRepository } from './BlockNumberRepository'
import { ChangelogRecord, ChangelogRepository } from './ChangelogRepository'
import { EventRepository } from './EventRepository'

describe(ChangelogRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new ChangelogRepository(database, Logger.SILENT)
  const blockRepo = new BlockNumberRepository(database, Logger.SILENT)
  const eventRepo = new EventRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(async () => {
    for (const repo of [repository, blockRepo, eventRepo]) {
      await repo.deleteAll()
    }
  })
  afterEach(async () => {
    for (const repo of [repository, blockRepo, eventRepo]) {
      await repo.deleteAll()
    }
  })

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

      const result = await repository.getAll()

      expect(result).toEqual([record1, record2])
    })
  })

  describe(ChangelogRepository.prototype.getFullChangelog.name, () => {
    it('finds full changelog', async () => {
      const expectedTimestamp = new UnixTime(1000)
      await blockRepo.add({
        blockNumber: record1.blockNumber,
        chainId: record1.chainId,
        timestamp: expectedTimestamp,
        blockHash: Hash256.random(),
      })
      const txHash = Hash256.random()
      await eventRepo.addMany([
        {
          chainId: record1.chainId,
          blockNumber: record1.blockNumber,
          txHash,
        },
      ])
      await repository.addMany([record1, record2])
      const result = await repository.getFullChangelog(
        record1.chainId,
        record1.targetAddress,
      )

      expect(result).toEqual([
        { ...record1, timestamp: expectedTimestamp, txHashes: [txHash] },
      ])
    })

    it('returns multiple tx_hashes if multiple events in the same block', async () => {
      const expectedTimestamp = new UnixTime(1000)
      await blockRepo.add({
        blockNumber: record1.blockNumber,
        chainId: record1.chainId,
        timestamp: expectedTimestamp,
        blockHash: Hash256.random(),
      })
      const event1 = {
        chainId: record1.chainId,
        blockNumber: record1.blockNumber,
        txHash: Hash256.random(),
      }
      const event2 = {
        chainId: record1.chainId,
        blockNumber: record1.blockNumber,
        txHash: Hash256.random(),
      }
      await eventRepo.addMany([event1, event2])
      await repository.addMany([record1, record2])
      const result = await repository.getFullChangelog(
        record1.chainId,
        record1.targetAddress,
      )

      expect(result).toEqualUnsorted([
        {
          ...record1,
          timestamp: expectedTimestamp,
          txHashes: [event1.txHash, event2.txHash],
        },
      ])
    })
  })

  describe(ChangelogRepository.prototype.deleteAll.name, () => {
    it('deletes all records', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAll()

      const result = await repository.getAll()

      expect(result).toEqual([])
    })
  })

  describe(ChangelogRepository.prototype.deleteAfter.name, () => {
    it('deletes entries after certain block', async () => {
      await repository.addMany([record1, record2])
      await repository.deleteAfter(1000, chainId)

      const result = await repository.getAll()

      expect(result).toEqual([record1])
    })
  })
})
