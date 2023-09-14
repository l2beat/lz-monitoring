import { assert, Logger } from '@l2beat/backend-tools'
import { Hash256, UnixTime } from '@lz/libs'
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
import { ClockIndexer } from './ClockIndexer'

describe(BlockNumberIndexer.name, () => {
  describe(BlockNumberIndexer.prototype.update.name, () => {
    it('downloads a new block and returns its timestamp without reorg', async () => {
      const [genesisBlock] = BLOCKS
      const fakeBlockchainClient = mockBlockchainClient(BLOCKS)
      const fakeBlockNumberRepository = mockBlockNumberRepository([
        blockToRecord(genesisBlock!),
      ])
      const fakeIndexerStateRepository = mockIndexerStateRepository()

      const blockNumberIndexer = new BlockNumberIndexer(
        fakeBlockchainClient,
        fakeBlockNumberRepository,
        fakeIndexerStateRepository,
        0,
        mockObject<ClockIndexer>({
          subscribe: () => {},
        }),
        Logger.SILENT,
      )

      /**
       * First run with genesis block already in the database
       * won't fetch a new block
       */
      expect(await blockNumberIndexer.update(0, 1)).toEqual(1)
      expect(
        fakeBlockchainClient.getBlockNumberAtOrBefore,
      ).toHaveBeenCalledWith(new UnixTime(1))
      expect(fakeBlockchainClient.getBlock).not.toHaveBeenCalled()

      /**
       * Second run with missing blocks in the database
       * will attempt to fetch next single block from BLOCKS - no. 1, timestamp: 1000
       * @see BLOCKS
       */
      expect(await blockNumberIndexer.update(0, 2000)).toEqual(1000)
      expect(
        fakeBlockchainClient.getBlockNumberAtOrBefore,
      ).toHaveBeenCalledWith(new UnixTime(2000))
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledWith(1)
      expect(fakeBlockNumberRepository.findByNumber).toHaveBeenCalledWith(0)

      /**
       * Third run with missing blocks in the database
       * will attempt to fetch next single block from BLOCKS - no. 2, timestamp: 2000
       * @see BLOCKS
       */
      expect(await blockNumberIndexer.update(1000, 2000)).toEqual(2000)
      expect(
        fakeBlockchainClient.getBlockNumberAtOrBefore,
      ).toHaveBeenCalledWith(new UnixTime(2000))
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledWith(2)
      expect(fakeBlockNumberRepository.findByNumber).toHaveBeenCalledWith(1)
    })

    it('downloads a new block and returns its timestamp with reorg', async () => {
      const [genesisBlock, firstBlock, secondBlock, thirdBlock] = BLOCKS

      const fakeBlockNumberRepository = mockBlockNumberRepository([
        blockToRecord(genesisBlock!),
        blockToRecord(firstBlock!),
      ])

      const fakeIndexerStateRepository = mockIndexerStateRepository()

      const fakeBlockchainClient = mockBlockchainClient(BLOCKS)

      const reorgedBlock = {
        number: 2,
        hash: Hash256.random().toString(),
        parentHash: HASH1,
        timestamp: 1500,
      }
      const reorgedBlockRecord: BlockNumberRecord = {
        blockNumber: reorgedBlock.number,
        blockHash: Hash256(reorgedBlock.hash),
        timestamp: new UnixTime(reorgedBlock.timestamp),
      }

      // Simulate reorg
      fakeBlockchainClient.getBlock.resolvesToOnce(reorgedBlock)

      const blockNumberIndexer = new BlockNumberIndexer(
        fakeBlockchainClient,
        fakeBlockNumberRepository,
        fakeIndexerStateRepository,
        1,
        mockObject<ClockIndexer>({
          subscribe: () => {},
        }),
        Logger.DEBUG,
      )

      await blockNumberIndexer.start()

      // Saves blocks to database + diff process
      expect(await blockNumberIndexer.update(0, 2000)).toEqual(1500)

      expect(fakeBlockNumberRepository.findLast).toHaveBeenCalledTimes(1)
      expect(
        fakeBlockchainClient.getBlockNumberAtOrBefore,
      ).toHaveBeenCalledWith(new UnixTime(2000))
      expect(fakeBlockNumberRepository.findByNumber).toHaveBeenCalledWith(1)
      expect(fakeBlockNumberRepository.add).toHaveBeenCalledWith(
        reorgedBlockRecord,
      )

      expect(await blockNumberIndexer.update(0, 3000)).toEqual(1000)

      expect(
        fakeBlockchainClient.getBlockNumberAtOrBefore,
      ).toHaveBeenCalledWith(new UnixTime(3000))
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledWith(
        thirdBlock!.number,
      )
      expect(fakeBlockNumberRepository.findByNumber).toHaveBeenCalledWith(
        secondBlock!.number,
      )
      expect(fakeBlockchainClient.getBlock).toHaveBeenCalledWith(
        blockToRecord(secondBlock!).blockHash,
      )
      expect(fakeBlockNumberRepository.findByNumber).toHaveBeenCalledWith(
        firstBlock!.number,
      )

      expect(await blockNumberIndexer.update(1000, 3000)).toEqual(3000)
      expect(fakeBlockNumberRepository.addMany).toHaveBeenCalledTimes(1)

      expect(fakeBlockNumberRepository.addMany).toHaveBeenNthCalledWith(
        1,
        [secondBlock!, thirdBlock!].map(blockToRecord),
      )
    })
  })
})

const HASH0 = Hash256.random()
const HASH1 = Hash256.random()
const HASH2 = Hash256.random()
const HASH3 = Hash256.random()
const HASH4 = Hash256.random()

const BLOCKS: BlockFromClient[] = [
  {
    number: 0,
    hash: HASH0.toString(),
    parentHash: '',
    timestamp: 0,
  },
  {
    number: 1,
    hash: HASH1.toString(),
    parentHash: HASH0.toString(),
    timestamp: 1000,
  },
  {
    number: 2,
    hash: HASH2.toString(),
    parentHash: HASH1.toString(),
    timestamp: 2000,
  },
  {
    number: 3,
    hash: HASH3.toString(),
    parentHash: HASH2.toString(),
    timestamp: 3000,
  },
  {
    number: 4,
    hash: HASH4.toString(),
    parentHash: HASH3.toString(),
    timestamp: 4000,
  },
]

function mockBlockNumberRepository(initialStorage: BlockNumberRecord[] = []) {
  const blockNumberStorage: BlockNumberRecord[] = [...initialStorage]

  return mockObject<BlockNumberRepository>({
    findByNumber: async (number) => {
      const result = blockNumberStorage.find(
        (bnr) => bnr.blockNumber === number,
      )

      console.dir({ method: 'findByNumber', number, result })
      return result
    },
    findLast: async () => {
      const result = blockNumberStorage.at(-1)
      console.dir({ method: 'findLast', result })
      return result
    },
    addMany: async (blocks: BlockNumberRecord[]) => {
      blockNumberStorage.push(...blocks)
      const result = blocks.map((b) => b.blockNumber)
      console.dir({ method: 'addMany', blocks, result })
      return result
    },
    add: async (block: BlockNumberRecord) => {
      blockNumberStorage.push(block)
      const result = block.blockNumber
      console.dir({ method: 'add', block })
      return result
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

      console.dir({ method: 'getBlockNumberAtOrBefore', timestamp, block })

      return Promise.resolve(block.number)
    },
    getBlock: async (blockId) => {
      if (typeof blockId === 'number') {
        const block = blockchainBlocks.find((b) => b.number === blockId)
        assert(block, `Block not found for given number: ${blockId}`)

        console.dir({ method: 'getBlock#number', blockId, block })

        return block
      }

      const block = blockchainBlocks.find((b) => b.hash === blockId.toString())
      console.dir({ method: 'getBlock#hash', blockId, block })
      assert(block, `Block not found for given hash: ${blockId}`)
      return block
    },
  })
}

function mockIndexerStateRepository(initialState: IndexerStateRecord[] = []) {
  const states: IndexerStateRecord[] = [...initialState]

  return mockObject<IndexerStateRepository>({
    findById: async (id) => {
      const result = states.find((s) => s.id === id)
      console.dir({ method: 'findById', id, result })
      return result
    },
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
    blockHash: Hash256(blockFromClient.hash),
    timestamp: new UnixTime(blockFromClient.timestamp),
  }
}
