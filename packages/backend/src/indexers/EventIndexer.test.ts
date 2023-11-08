import { assert, Logger } from '@l2beat/backend-tools'
import { ProviderWithCache } from '@l2beat/discovery'
import { ChainId, EthereumAddress, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'
import { BigNumber, providers } from 'ethers'

import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'
import { EventIndexer } from './EventIndexer'

describe(EventIndexer.name, () => {
  describe(EventIndexer.prototype.update.name, () => {
    it('should update from start block', async () => {
      const startBlock = 15
      const maxEventRange = 10
      const chainId = ChainId.ETHEREUM
      const address = EthereumAddress.random()
      const topics = [
        ['event Transfer(address from, address to, uint256 value)'],
      ]
      const eventsToWatch = [
        {
          address,
          topics,
        },
      ]

      const blockFromClient = mockBlockFromProvider(startBlock + maxEventRange)
      const blockchainClient = mockObject<ProviderWithCache>({
        getBlock: async () => blockFromClient,
        getLogsBatch: async () => [],
      })
      const blockRepo = mockObject<BlockNumberRepository>({
        findAtOrBefore: async (time) =>
          time.toNumber() === 100 ? mockBlock(100) : undefined,
        addMany: async () => 0,
      })
      const indexer = new EventIndexer(
        blockchainClient,
        blockRepo,
        mockObject<EventRepository>(),
        mockObject<IndexerStateRepository>(),
        chainId,
        eventsToWatch,
        {
          maxBlockBatchSize: maxEventRange,
          startBlock,
        },
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => undefined,
        }),

        Logger.SILENT,
      )

      await indexer.update(0, 100)
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(1)
      expect(blockchainClient.getBlock).toHaveBeenCalledWith(
        startBlock + maxEventRange,
      )
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledTimes(1)
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledWith(
        address,
        topics,
        startBlock,
        startBlock + maxEventRange,
      )
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(1)
      expect(blockRepo.addMany).toHaveBeenCalledTimes(1)
      expect(blockRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockHash: Hash256(blockFromClient.hash),
          blockNumber: blockFromClient.number,
          chainId,
          timestamp: new UnixTime(blockFromClient.timestamp),
        },
      ])
    })

    it('should add blocks with events to eventRepository and blockNumber repository', async () => {
      const startBlockNumber = 15
      const maxEventRange = 10
      const chainId = ChainId.ETHEREUM
      const address = EthereumAddress.random()
      const topics = [
        ['event Transfer(address from, address to, uint256 value)'],
      ]
      const eventsToWatch = [
        {
          address,
          topics,
        },
      ]

      const blockWithEvent = mockBlockFromProvider(startBlockNumber + 1)
      const blocksFromClient = [
        mockBlockFromProvider(startBlockNumber + maxEventRange),
        blockWithEvent,
      ] as const

      const eventLog = mockLog(blockWithEvent.number)
      const blockchainClient = mockObject<ProviderWithCache>({
        getBlock: async (blockNumber) => {
          const block = blocksFromClient.find((b) => b.number === blockNumber)
          assert(block, `Block ${blockNumber.toString()} not found`)
          return block
        },
        getLogsBatch: async () => [eventLog],
      })
      const blockRepo = mockObject<BlockNumberRepository>({
        findAtOrBefore: async (time) =>
          time.toNumber() === 100 ? mockBlock(100) : undefined,
        findByNumber: async () => undefined,
        addMany: async () => 0,
      })
      const eventsRepo = mockObject<EventRepository>({
        addMany: async () => 0,
      })
      const indexer = new EventIndexer(
        blockchainClient,
        blockRepo,
        eventsRepo,
        mockObject<IndexerStateRepository>(),
        chainId,
        eventsToWatch,
        {
          maxBlockBatchSize: maxEventRange,
          startBlock: startBlockNumber,
        },
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => undefined,
        }),
        Logger.SILENT,
      )

      await indexer.update(0, 100)
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(blockchainClient.getBlock).toHaveBeenNthCalledWith(
        2,
        startBlockNumber + 1,
      )
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledTimes(1)
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledWith(
        address,
        topics,
        startBlockNumber,
        startBlockNumber + maxEventRange,
      )
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(blockchainClient.getBlock).toHaveBeenNthCalledWith(
        2,
        startBlockNumber + 1,
      )
      expect(blockRepo.addMany).toHaveBeenCalledTimes(1)
      expect(blockRepo.addMany).toHaveBeenNthCalledWith(
        1,
        blocksFromClient.map((block) => ({
          blockHash: Hash256(block.hash),
          blockNumber: block.number,
          chainId,
          timestamp: new UnixTime(block.timestamp),
        })),
      )
      expect(eventsRepo.addMany).toHaveBeenCalledTimes(1)
      expect(eventsRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockNumber: blockWithEvent.number,
          txHash: Hash256(eventLog.transactionHash),
          chainId,
        },
      ])
    })

    it('should call multiple batches', async () => {
      const startBlock = 15
      const maxEventRange = 1
      const amtBatches = 10
      const chainId = ChainId.ETHEREUM
      const address = EthereumAddress.random()
      const topics = [
        ['event Transfer(address from, address to, uint256 value)'],
      ]
      const eventsToWatch = [
        {
          address,
          topics,
        },
      ]

      const blocksFromClient = [
        mockBlockFromProvider(startBlock + maxEventRange * amtBatches),
        mockBlockFromProvider(startBlock + 1),
      ] as const

      const eventLog = mockLog(startBlock + 1)
      const blockchainClient = mockObject<ProviderWithCache>({
        getBlock: async (blockNumber) => {
          const block = blocksFromClient.find((b) => b.number === blockNumber)
          assert(block, `Block ${blockNumber.toString()} not found`)
          return block
        },
        getLogsBatch: async () => [eventLog],
      })
      const blockRepo = mockObject<BlockNumberRepository>({
        findAtOrBefore: async (time) =>
          time.toNumber() === 100 ? mockBlock(100) : undefined,
        findByNumber: async () => undefined,
        addMany: async () => 0,
      })
      const eventsRepo = mockObject<EventRepository>({
        addMany: async () => 0,
      })
      const indexer = new EventIndexer(
        blockchainClient,
        blockRepo,
        eventsRepo,
        mockObject<IndexerStateRepository>(),
        chainId,
        eventsToWatch,
        {
          amtBatches,
          maxBlockBatchSize: maxEventRange,
          startBlock,
        },
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => undefined,
        }),

        Logger.SILENT,
      )

      await indexer.update(0, 100)
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(blockchainClient.getBlock).toHaveBeenNthCalledWith(
        2,
        startBlock + 1,
      )
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledTimes(10)
      expect(blockchainClient.getLogsBatch).toHaveBeenNthCalledWith(
        1,
        address,
        topics,
        startBlock,
        startBlock + 1,
      )
      expect(blockchainClient.getLogsBatch).toHaveBeenNthCalledWith(
        5,
        address,
        topics,
        startBlock + 4,
        startBlock + 5,
      )
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(blockchainClient.getBlock).toHaveBeenNthCalledWith(
        2,
        startBlock + 1,
      )
      expect(blockRepo.addMany).toHaveBeenCalledTimes(1)
      expect(blockRepo.addMany).toHaveBeenNthCalledWith(
        1,
        blocksFromClient.map((block) => ({
          blockHash: Hash256(block.hash),
          blockNumber: block.number,
          chainId,
          timestamp: new UnixTime(block.timestamp),
        })),
      )
      expect(eventsRepo.addMany).toHaveBeenCalledTimes(1)
      expect(eventsRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockNumber: eventLog.blockNumber,
          txHash: Hash256(eventLog.transactionHash),
          chainId,
        },
      ])
    })

    it('does not go over to block', async () => {
      const startBlock = 90
      const maxEventRange = 10
      const amtBatches = 10
      const toBlockNumber = 101
      const blockWithEvents = startBlock + 1
      const chainId = ChainId.ETHEREUM
      const address = EthereumAddress.random()
      const topics = [
        ['event Transfer(address from, address to, uint256 value)'],
      ]
      const eventsToWatch = [
        {
          address,
          topics,
        },
      ]

      const blocksFromClient = [mockBlockFromProvider(blockWithEvents)] as const

      const eventLog = mockLog(blockWithEvents)
      const blockchainClient = mockObject<ProviderWithCache>({
        getBlock: async (blockNumber) => {
          const block = blocksFromClient.find((b) => b.number === blockNumber)
          assert(block, `Block ${blockNumber.toString()} not found`)
          return block
        },
        getLogsBatch: async () => [eventLog],
      })
      const blockRepo = mockObject<BlockNumberRepository>({
        findByNumber: async () => undefined,
        addMany: async () => 0,
      })
      const eventsRepo = mockObject<EventRepository>({
        addMany: async () => 0,
      })
      const indexer = new EventIndexer(
        blockchainClient,
        blockRepo,
        eventsRepo,
        mockObject<IndexerStateRepository>(),
        chainId,
        eventsToWatch,
        {
          amtBatches,
          maxBlockBatchSize: maxEventRange,
          startBlock,
        },
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => undefined,
        }),

        Logger.SILENT,
      )
      await indexer.update(0, toBlockNumber)
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledTimes(2)
      expect(blockchainClient.getLogsBatch).toHaveBeenNthCalledWith(
        1,
        address,
        topics,
        startBlock,
        startBlock + maxEventRange,
      )
      expect(blockchainClient.getLogsBatch).toHaveBeenNthCalledWith(
        2,
        address,
        topics,
        startBlock + maxEventRange,
        toBlockNumber,
      )
      expect(blockchainClient.getBlock).toHaveBeenCalledTimes(1)
      expect(blockchainClient.getBlock).toHaveBeenNthCalledWith(
        1,
        blockWithEvents,
      )
      expect(blockRepo.addMany).toHaveBeenCalledTimes(1)
      expect(blockRepo.addMany).toHaveBeenNthCalledWith(
        1,
        blocksFromClient.map((block) => ({
          blockHash: Hash256(block.hash),
          blockNumber: block.number,
          chainId,
          timestamp: new UnixTime(block.timestamp),
        })),
      )
      expect(eventsRepo.addMany).toHaveBeenCalledTimes(1)
      expect(eventsRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockNumber: blockWithEvents,
          txHash: Hash256(eventLog.transactionHash),
          chainId,
        },
      ])
    })
  })
})

function mockBlock(blockNumber: number): BlockNumberRecord {
  return {
    blockNumber,
    blockHash: Hash256.random(),
    timestamp: new UnixTime(blockNumber * 1000),
    chainId: ChainId.ETHEREUM,
  }
}

function mockBlockFromProvider(blockTag: number | Hash256): providers.Block {
  const base = {
    transactions: [],
    gasLimit: BigNumber.from(0),
    gasUsed: BigNumber.from(0),
    miner: EthereumAddress.random().toString(),
    nonce: '0x',
    difficulty: 0,
    _difficulty: BigNumber.from(0),
    extraData: '0x',
  }
  if (typeof blockTag === 'number') {
    return {
      ...base,
      hash: Hash256.random().toString(),
      parentHash: Hash256.random().toString(),
      number: blockTag,
      timestamp: blockTag * 1000,
    }
  }

  return {
    ...base,
    hash: blockTag.toString(),
    number: 10,
    timestamp: 100,
    parentHash: Hash256.random().toString(),
  }
}

function mockLog(blockNumber: number): providers.Log {
  return {
    blockNumber,
    transactionHash: Hash256.random().toString(),
    transactionIndex: 0,
    address: EthereumAddress.random().toString(),
    data: '0x',
    topics: [],
    logIndex: 0,
    blockHash: Hash256.random().toString(),
    removed: false,
  }
}
