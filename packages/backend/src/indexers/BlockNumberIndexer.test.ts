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
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'
import { ClockIndexer } from './ClockIndexer'

describe(BlockNumberIndexer.name, () => {
  describe(BlockNumberIndexer.prototype.update.name, () => {
    it('downloads a new block and returns its timestamp without reorg', async () => {
      const blockNumberIndexer = new BlockNumberIndexer(
        mockObject<BlockchainClient>({
          getBlockNumberAtOrBefore,
          getBlock: async (number) => mockBlock(number),
        }),
        mockObject<BlockNumberRepository>({
          findByNumber: async (number) => mockBlockRecord(number),
          addMany: async () => [0],
          add: async () => 0,
        }),
        mockObject<IndexerStateRepository>(),
        0,
        mockObject<ClockIndexer>({
          subscribe: () => {},
        }),
        Logger.SILENT,
      )

      // from stays at 0 as we do not check against `from` value
      expect(await blockNumberIndexer.update(0, 1)).toEqual(0)
      expect(await blockNumberIndexer.update(0, 2000)).toEqual(1000)
      expect(await blockNumberIndexer.update(1000, 2000)).toEqual(2000)
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
      expect(memoryBlockNumberRepository.addMany).toHaveBeenNthCalledWith(
        1,
        [BLOCKS[2], BLOCKS[3]].map(blockToRecord),
      )
    })
  })
})

const HASH0 = Hash256.random()
const HASH1 = Hash256.random()
const HASH2 = Hash256.random()
const HASH3 = Hash256.random()
const HASH4 = Hash256.random()

const BLOCKS = [
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
] as const

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

function mockBlockNumberRepository(initialStorage: BlockNumberRecord[]) {
  const blockNumberStorage: BlockNumberRecord[] = [...initialStorage]

  return mockObject<BlockNumberRepository>({
    findByNumber: async (number) =>
      blockNumberStorage.find((bnr) => bnr.blockNumber === number),
    findLast: async () => blockNumberStorage.at(-1),
    addMany: async (blocks: BlockNumberRecord[]) => {
      blockNumberStorage.push(...blocks)
      return blocks.map((b) => b.blockNumber)
    },
    add: async (block: BlockNumberRecord) => {
      blockNumberStorage.push(block)
      return block.blockNumber
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
