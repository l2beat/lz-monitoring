import { assert, Logger } from '@l2beat/backend-tools'
import { Hash256, UnixTime } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'

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
      const memoryBlockNumberRepository = mockBlockNumberRepository([
        blockToRecord(BLOCKS[1]!),
      ])

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
      const blockNumberIndexer = new BlockNumberIndexer(
        mockObject<BlockchainClient>({
          getBlockNumberAtOrBefore,
          getBlock: mockFn(async (number: number) =>
            mockBlock(number),
          ).resolvesToOnce(reorgedBlock),
        }),
        memoryBlockNumberRepository,
        mockObject<IndexerStateRepository>({
          findById: async () => ({ id: 'BlockNumberIndexer', height: 1 }),
        }),
        1,
        mockObject<ClockIndexer>({
          subscribe: () => {},
        }),
        Logger.DEBUG,
      )

      await blockNumberIndexer.start()

      // saves block to database
      expect(await blockNumberIndexer.update(0, 2000)).toEqual(1500)
      expect(memoryBlockNumberRepository.add).toHaveBeenCalledWith(
        reorgedBlockRecord,
      )

      expect(await blockNumberIndexer.update(0, 3000)).toEqual(1000)
      expect(await blockNumberIndexer.update(1000, 3000)).toEqual(3000)
      expect(memoryBlockNumberRepository.addMany).toHaveBeenCalledTimes(1)

      const block2 = BLOCKS[2]
      const block3 = BLOCKS[3]

      assert(block2)
      assert(block3)

      expect(memoryBlockNumberRepository.addMany).toHaveBeenNthCalledWith(
        1,
        [block2, block3].map(blockToRecord),
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

function mockBlockRecord(blockNumber: number): BlockNumberRecord | undefined {
  if (blockNumber === 0) {
    return
  }
  const block = BLOCKS.find((b) => b.number === blockNumber)
  assert(block, `Block not found for given number: ${blockNumber}`)
  return {
    blockNumber: block.number,
    blockHash: Hash256(block.hash),
    timestamp: new UnixTime(block.timestamp),
  }
}

function mockBlock(blockId: number | Hash256): BlockFromClient {
  console.log('mockBlock', blockId)
  if (typeof blockId === 'number') {
    const block = BLOCKS.find((b) => b.number === blockId)
    assert(block, `Block not found for given number: ${blockId}`)
    return block
  }

  const block = BLOCKS.find((b) => b.hash === blockId.toString())
  assert(block, `Block not found for given hash: ${blockId}`)
  return block
}

function getBlockNumberAtOrBefore(timestamp: UnixTime): Promise<number> {
  const block = BLOCKS.filter((b) => b.timestamp <= timestamp.toNumber())
    .sort((a, b) => b.timestamp - a.timestamp)
    .shift()
  assert(block, `Block not found for given timestamp: ${timestamp.toString()}`)
  console.log('getBlockNumberAtOrBefore', timestamp.toString(), block.number)
  return Promise.resolve(block.number)
}

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
