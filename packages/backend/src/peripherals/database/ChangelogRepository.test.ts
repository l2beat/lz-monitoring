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

  before(() =>
    [repository, blockRepo, eventRepo].forEach((repo) => void repo.deleteAll()),
  )
  afterEach(() =>
    [repository, blockRepo, eventRepo].forEach((repo) => void repo.deleteAll()),
  )

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

  describe(ChangelogRepository.prototype.getChangesSummary.name, () => {
    it('finds changes summary', async () => {
      const expectedTimestamp = new UnixTime(1000)
      await blockRepo.addMany([
        {
          blockNumber: record1.blockNumber,
          chainId: record1.chainId,
          timestamp: expectedTimestamp,
          blockHash: Hash256.random(),
        },
        {
          blockNumber: record2.blockNumber,
          chainId: record2.chainId,
          timestamp: expectedTimestamp,
          blockHash: Hash256.random(),
        },
      ])
      await repository.addMany([record1, record2])
      const result = await repository.getChangesSummary(chainId)

      expect(sortArray(result)).toEqual(
        sortArray([
          {
            count: 1,
            lastChangeTimestamp: expectedTimestamp,
            address: record1.targetAddress,
          },
          {
            count: 1,
            lastChangeTimestamp: expectedTimestamp,
            address: record2.targetAddress,
          },
        ]),
      )
    })

    it('does not count changes in the same block twice', async () => {
      const expectedTimestamp = new UnixTime(1000)
      const blockRepo = new BlockNumberRepository(database, Logger.SILENT)
      await blockRepo.add({
        blockNumber: record2.blockNumber,
        chainId: record2.chainId,
        timestamp: expectedTimestamp,
        blockHash: Hash256.random(),
      })
      await repository.addMany([record1, record2, record2])
      const result = await repository.getChangesSummary(chainId)

      expect(sortArray(result)).toEqual(
        sortArray([
          {
            count: 1,
            lastChangeTimestamp: expectedTimestamp,
            address: record1.targetAddress,
          },
          {
            count: 1,
            lastChangeTimestamp: expectedTimestamp,
            address: record2.targetAddress,
          },
        ]),
      )
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
        { ...record1, timestamp: expectedTimestamp, txHash },
      ])
    })

    it('returns array if multiple events in the same block', async () => {
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
        { ...record1, timestamp: expectedTimestamp, txHash: event1.txHash },
        { ...record1, timestamp: expectedTimestamp, txHash: event2.txHash },
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

function sortArray<T extends { address: EthereumAddress }>(arr: T[]): T[] {
  return arr.sort((a, b) =>
    a.address.toString().localeCompare(b.address.toString()),
  )
}
