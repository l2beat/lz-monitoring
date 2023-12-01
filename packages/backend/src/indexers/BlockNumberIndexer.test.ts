import { assert, Logger } from '@l2beat/backend-tools'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'

import {
  BlockchainClient,
  BlockFromClient,
} from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import {
  IndexerStateRecord,
  IndexerStateRepository,
} from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'
import { LatestBlockNumberIndexer } from './LatestBlockNumberIndexer'

describe(BlockNumberIndexer.name, () => {
  describe(BlockNumberIndexer.prototype.update.name, () => {
    it('downloads a new block and returns its block number without reorg', async () => {
      const chainId = ChainId.ETHEREUM
      const [genesisBlock] = BLOCKS
      const fakeBlockchainClient = mockBlockchainClient([...BLOCKS])
      const fakeBlockNumberRepository = mockBlockNumberRepository([
        blockToRecord(genesisBlock),
      ])
      const fakeIndexerStateRepository = mockIndexerStateRepository()

      const blockNumberIndexer = new BlockNumberIndexer(
        fakeBlockchainClient,
        fakeBlockNumberRepository,
        fakeIndexerStateRepository,
        0,
        chainId,
        mockObject<LatestBlockNumberIndexer>({
          subscribe: () => {},
        }),
        Logger.SILENT,
      )

      /**
       * First run with genesis block already in the database
       * will fetch block no. 1 and compare its parent hash
       */
      expect(await blockNumberIndexer.update(0, 1)).toEqual(1)
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(1, 0)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(2, 1)
      expect(fakeBlockNumberRepository.findLast).toHaveBeenNthCalledWith(
        1,
        chainId,
      )
      expect(fakeBlockNumberRepository.add).toHaveBeenCalledTimes(1)
      expect(fakeBlockNumberRepository.add).toHaveBeenNthCalledWith(
        1,
        blockToRecord(BLOCKS[1]),
      )

      /**
       * Second run with missing blocks in the database
       * will attempt to fetch next single block from BLOCKS - no. 1
       * @see BLOCKS
       */
      expect(await blockNumberIndexer.update(1, 2)).toEqual(2)
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledTimes(4)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(3, 1)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(4, 2)
      expect(fakeBlockNumberRepository.findLast).toHaveBeenNthCalledWith(
        2,
        chainId,
      )
      expect(fakeBlockNumberRepository.add).toHaveBeenCalledTimes(2)
      expect(fakeBlockNumberRepository.add).toHaveBeenNthCalledWith(
        2,
        blockToRecord(BLOCKS[2]),
      )

      /**
       * Third run with missing blocks in the database
       * will attempt to fetch next single block from BLOCKS - no. 2
       * @see BLOCKS
       */
      expect(await blockNumberIndexer.update(2, 3)).toEqual(3)
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledTimes(6)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(5, 2)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(6, 3)
      expect(fakeBlockNumberRepository.findLast).toHaveBeenNthCalledWith(
        3,
        chainId,
      )
      expect(fakeBlockNumberRepository.add).toHaveBeenCalledTimes(3)
      expect(fakeBlockNumberRepository.add).toHaveBeenNthCalledWith(
        3,
        blockToRecord(BLOCKS[3]),
      )
    })

    it('downloads a new block and returns its block number with reorg', async () => {
      const chainId = ChainId.ETHEREUM
      const [genesisBlock, firstBlock, secondBlock] = BLOCKS

      const fakeBlockNumberRepository = mockBlockNumberRepository([
        blockToRecord(genesisBlock),
        blockToRecord(firstBlock),
      ])

      const fakeIndexerStateRepository = mockIndexerStateRepository()

      const fakeBlockchainClient = mockBlockchainClient([...BLOCKS])

      const reorgedBlock = {
        number: 2,
        hash: Hash256.random(),
        parentHash: HASH1,
        timestamp: 1500,
      }
      const reorgedBlockRecord: BlockNumberRecord = {
        blockNumber: reorgedBlock.number,
        blockHash: reorgedBlock.hash,
        timestamp: new UnixTime(reorgedBlock.timestamp),
        chainId,
      }

      // Simulate reorg
      fakeBlockchainClient.getBlock
        .resolvesToOnce(firstBlock)
        .resolvesToOnce(reorgedBlock)

      const blockNumberIndexer = new BlockNumberIndexer(
        fakeBlockchainClient,
        fakeBlockNumberRepository,
        fakeIndexerStateRepository,
        1,
        chainId,
        mockObject<LatestBlockNumberIndexer>({
          subscribe: () => {},
        }),
        Logger.DEBUG,
      )

      await blockNumberIndexer.start()
      expect(fakeBlockNumberRepository.findLast).toHaveBeenCalledTimes(1)

      // Saves blocks to database + diff process
      expect(await blockNumberIndexer.update(0, 2)).toEqual(2)
      expect(
        fakeBlockNumberRepository.findBlockNumberBefore,
      ).not.toHaveBeenCalled()
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledTimes(2)
      expect(fakeBlockNumberRepository.findLast).toHaveBeenCalledTimes(2)
      expect(fakeBlockNumberRepository.add).toHaveBeenCalledTimes(1)
      expect(fakeBlockNumberRepository.add).toHaveBeenNthCalledWith(
        1,
        reorgedBlockRecord,
      )

      // Reorg happened so we reduce the safeHeight to 1
      expect(await blockNumberIndexer.update(0, 3)).toEqual(1)
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledTimes(4)
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(
        3,
        secondBlock.number,
      )
      expect(fakeBlockchainClient.getBlock).toHaveBeenNthCalledWith(
        4,
        firstBlock.number,
      )
      expect(
        fakeBlockNumberRepository.findBlockNumberBefore,
      ).toHaveBeenCalledTimes(1)
      expect(
        fakeBlockNumberRepository.findBlockNumberBefore,
      ).toHaveBeenCalledWith(secondBlock.number, chainId)

      expect(await blockNumberIndexer.update(1, 3)).toEqual(3)
      expect(fakeBlockNumberRepository.addMany).toHaveBeenCalledTimes(1)
      expect(fakeBlockNumberRepository.addMany).toHaveBeenNthCalledWith(
        1,
        [secondBlock].map(blockToRecord),
      )
    })
  })

  describe(BlockNumberIndexer.prototype.invalidate.name, () => {
    it('invalidates data after invalidation point by passing block number to repository', async () => {
      const chainId = ChainId.ETHEREUM
      const INVALIDATION_BLOCK_INDEX = Math.floor(BLOCKS.length / 2)
      const INVALIDATION_BLOCK_NUMBER = BLOCKS[INVALIDATION_BLOCK_INDEX]!.number

      const fakeBlockchainClient = mockBlockchainClient([...BLOCKS])
      const fakeBlockNumberRepository = mockBlockNumberRepository(
        BLOCKS.map(blockToRecord),
      )
      const fakeIndexerStateRepository = mockIndexerStateRepository()

      const blockNumberIndexer = new BlockNumberIndexer(
        fakeBlockchainClient,
        fakeBlockNumberRepository,
        fakeIndexerStateRepository,
        0,
        chainId,
        mockObject<LatestBlockNumberIndexer>({
          subscribe: () => {},
        }),
        Logger.SILENT,
      )

      expect(
        await blockNumberIndexer.invalidate(INVALIDATION_BLOCK_NUMBER),
      ).toEqual(INVALIDATION_BLOCK_NUMBER)
      expect(fakeBlockNumberRepository.deleteAfter).toHaveBeenCalledWith(
        INVALIDATION_BLOCK_NUMBER,
        chainId,
      )
    })
  })
})
const HASH_ZERO = Hash256('0x' + '0'.repeat(64))
const HASH0 = Hash256.random()
const HASH1 = Hash256.random()
const HASH2 = Hash256.random()
const HASH3 = Hash256.random()
const HASH4 = Hash256.random()

const BLOCKS = [
  {
    number: 0,
    hash: HASH0,
    parentHash: HASH_ZERO,
    timestamp: 0,
  },
  {
    number: 1,
    hash: HASH1,
    parentHash: HASH0,
    timestamp: 1000,
  },
  {
    number: 2,
    hash: HASH2,
    parentHash: HASH1,
    timestamp: 2000,
  },
  {
    number: 3,
    hash: HASH3,
    parentHash: HASH2,
    timestamp: 3000,
  },
  {
    number: 4,
    hash: HASH4,
    parentHash: HASH3,
    timestamp: 4000,
  },
] as const

export function mockBlockNumberRepository(
  initialStorage: BlockNumberRecord[] = [],
) {
  const blockNumberStorage: BlockNumberRecord[] = [...initialStorage]

  return mockObject<BlockNumberRepository>({
    findByNumber: async (number) =>
      blockNumberStorage.find((bnr) => bnr.blockNumber === number),
    findLast: async () => blockNumberStorage.at(-1),
    findAtOrBefore: async (timestamp) =>
      blockNumberStorage
        .filter((bnr) => timestamp.gte(bnr.timestamp))
        .sort((a, b) => b.timestamp.toNumber() - a.timestamp.toNumber())
        .shift(),
    findBlockNumberBefore: async (blockNumber) =>
      blockNumberStorage
        .filter((bnr) => bnr.blockNumber < blockNumber)
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .shift(),
    getByTimestamp: async (timestamp) =>
      blockNumberStorage.filter((bnr) => timestamp.equals(bnr.timestamp)),
    addMany: async (blocks: BlockNumberRecord[]) => {
      blockNumberStorage.push(...blocks)
      return blocks.length
    },
    add: async (block: BlockNumberRecord) => {
      blockNumberStorage.push(block)
      return block.blockNumber
    },
    deleteAfter: async (blockNumber) => {
      // Implementation doesn't matter here
      return blockNumber
    },
  })
}

function mockBlockchainClient(blocks: BlockFromClient[]) {
  const blockchainBlocks = [...blocks]

  return mockObject<BlockchainClient>({
    getBlockNumberAtOrBefore: async (timestamp) => {
      const block = blockchainBlocks
        .filter((b) => b.timestamp <= timestamp.toNumber())
        .sort((a, b) => b.timestamp - a.timestamp)
        .shift()
      assert(
        block,
        `Block not found for given timestamp: ${timestamp.toString()}`,
      )

      return Promise.resolve(block.number)
    },
    getBlock: async (blockId) => {
      if (typeof blockId === 'number') {
        const block = blockchainBlocks.find((b) => b.number === blockId)
        assert(block, `Block not found for given number: ${blockId}`)

        return block
      }

      const block = blockchainBlocks.find((b) => b.hash === blockId)
      assert(block, `Block not found for given hash: ${blockId.toString()}`)
      return block
    },
  })
}

function mockIndexerStateRepository(initialState: IndexerStateRecord[] = []) {
  const states: IndexerStateRecord[] = [...initialState]

  return mockObject<IndexerStateRepository>({
    findById: async (id) => states.find((s) => s.id === id),
    addOrUpdate: async (record) => {
      const presentState = states.find((s) => s.id === record.id)

      if (presentState) {
        presentState.height = record.height

        return record.id
      } else {
        states.push(record)
        return record.id
      }
    },
  })
}

function blockToRecord(blockFromClient: BlockFromClient): BlockNumberRecord {
  return {
    blockNumber: blockFromClient.number,
    blockHash: blockFromClient.hash,
    timestamp: new UnixTime(blockFromClient.timestamp),
    chainId: ChainId.ETHEREUM,
  }
}
