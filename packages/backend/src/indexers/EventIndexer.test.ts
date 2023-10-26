import { assert, Logger } from '@l2beat/backend-tools'
import { ChainId, EthereumAddress, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'
import { providers } from 'ethers'

import {
  BlockchainClient,
  BlockFromClient,
} from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'
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

      const blockFromClient = mockBlockFromClient(startBlock + maxEventRange)
      const blockchainClient = mockObject<BlockchainClient>({
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
        mockObject<BlockNumberIndexer>({
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
          blockHash: blockFromClient.hash,
          blockNumber: blockFromClient.number,
          chainId,
          timestamp: new UnixTime(blockFromClient.timestamp),
        },
      ])
    })

    it('should add blocks with events to eventRepository and blockNumber repository', async () => {
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

      const blocksFromClient = [
        mockBlockFromClient(startBlock + maxEventRange),
        mockBlockFromClient(startBlock + 1),
      ] as const

      const blockchainClient = mockObject<BlockchainClient>({
        getBlock: async (blockNumber) => {
          const block = blocksFromClient.find((b) => b.number === blockNumber)
          assert(block, `Block ${blockNumber.toString()} not found`)
          return block
        },
        getLogsBatch: async () => [mockLog(startBlock + 1)],
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
          startBlock,
        },
        mockObject<BlockNumberIndexer>({
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
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledTimes(1)
      expect(blockchainClient.getLogsBatch).toHaveBeenCalledWith(
        address,
        topics,
        startBlock,
        startBlock + maxEventRange,
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
          blockHash: block.hash,
          blockNumber: block.number,
          chainId,
          timestamp: new UnixTime(block.timestamp),
        })),
      )
      expect(eventsRepo.addMany).toHaveBeenCalledTimes(1)
      expect(eventsRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockNumber: startBlock + 1,
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
        mockBlockFromClient(startBlock + maxEventRange * amtBatches),
        mockBlockFromClient(startBlock + 1),
      ] as const

      const blockchainClient = mockObject<BlockchainClient>({
        getBlock: async (blockNumber) => {
          const block = blocksFromClient.find((b) => b.number === blockNumber)
          assert(block, `Block ${blockNumber.toString()} not found`)
          return block
        },
        getLogsBatch: async () => [mockLog(startBlock + 1)],
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
        mockObject<BlockNumberIndexer>({
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
          blockHash: block.hash,
          blockNumber: block.number,
          chainId,
          timestamp: new UnixTime(block.timestamp),
        })),
      )
      expect(eventsRepo.addMany).toHaveBeenCalledTimes(1)
      expect(eventsRepo.addMany).toHaveBeenNthCalledWith(1, [
        {
          blockNumber: startBlock + 1,
          chainId,
        },
      ])
    })

    it('should throw if no toBlockNumber', async () => {
      const startBlock = 15
      const chainId = ChainId.ETHEREUM
      const address = EthereumAddress.random()
      const eventsToWatch = [
        {
          address,
          topics: [['event Transfer(address from, address to, uint256 value)']],
        },
      ]
      const indexer = new EventIndexer(
        mockObject<BlockchainClient>(),
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => undefined,
        }),
        mockObject<EventRepository>(),
        mockObject<IndexerStateRepository>(),
        chainId,
        eventsToWatch,
        {
          maxBlockBatchSize: 10,
          startBlock,
        },
        mockObject<BlockNumberIndexer>({
          subscribe: () => undefined,
        }),
        Logger.SILENT,
      )

      await expect(indexer.update(0, 100)).toBeRejectedWith(
        'toBlockNumber not found',
      )
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

function mockBlockFromClient(blockTag: number | Hash256): BlockFromClient {
  if (typeof blockTag === 'number') {
    return {
      hash: Hash256.random(),
      parentHash: Hash256.random(),
      number: blockTag,
      timestamp: blockTag * 1000,
    }
  }

  return {
    hash: blockTag,
    number: 10,
    timestamp: 100,
    parentHash: Hash256.random(),
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
