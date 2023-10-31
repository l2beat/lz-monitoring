import { Logger } from '@l2beat/backend-tools'
import { DiscoveryConfig, DiscoveryEngine } from '@l2beat/discovery'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'

import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { mockBlockNumberRepository } from './BlockNumberIndexer.test'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'
import { DiscoveryIndexer } from './DiscoveryIndexer'
import { EventIndexer } from './EventIndexer'

describe(DiscoveryIndexer.name, () => {
  describe(DiscoveryIndexer.prototype.update.name, () => {
    it('should run discovery on the latest block with event', async () => {
      const chainId = ChainId.ETHEREUM
      const BLOCK_100 = mockBlock({
        blockNumber: 100,
        timestamp: new UnixTime(1000),
      })
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const blockRepo = mockObject<BlockNumberRepository>({
        findAtOrBefore: async () => BLOCK_100,
        findByNumber: async () => BLOCK_100,
        getByTimestamp: async () => [BLOCK_100],
      })
      const eventRepo = mockObject<EventRepository>({
        getSortedInRange: async () => [
          {
            chainId,
            blockNumber: BLOCK_100.blockNumber,
          },
        ],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        add: async () => true,
        findAtOrBefore: async () => undefined,
      })

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        blockRepo,
        eventRepo,
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await discoveryIndexer.update(0, 2000)).toEqual(
        BLOCK_100.timestamp.toNumber(),
      )
      expect(blockRepo.findByNumber).toHaveBeenCalledTimes(1)
      expect(blockRepo.findByNumber).toHaveBeenNthCalledWith(
        1,
        BLOCK_100.blockNumber,
        chainId,
      )
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(
        1,
        config,
        BLOCK_100.blockNumber,
      )
      expect(discoveryRepository.add).toHaveBeenNthCalledWith(1, {
        chainId,
        blockNumber: BLOCK_100.blockNumber,
        discoveryOutput: {
          version: 3,
          name: 'test',
          configHash: config.hash,
          chain: 'ethereum',
          blockNumber: BLOCK_100.blockNumber,
          contracts: [],
          eoas: [],
          abis: {},
        },
      })
    })

    it('should not run discovery if no blocks with events', async () => {
      const config = mockConfig()
      const chainId = ChainId.ETHEREUM
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const eventRepo = mockObject<EventRepository>({
        getSortedInRange: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        add: async () => true,
      })

      const disocoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async (timestamp: UnixTime) =>
            mockBlock({ timestamp, blockNumber: timestamp.toNumber() / 1000 }),
        }),
        eventRepo,
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await disocoveryIndexer.update(1000, 2000)).toEqual(2000)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
      expect(discoveryRepository.add).not.toHaveBeenCalled()
      expect(eventRepo.getSortedInRange).toHaveBeenCalledTimes(1)
      expect(eventRepo.getSortedInRange).toHaveBeenNthCalledWith(
        1,
        1,
        2,
        chainId,
      )
    })

    it('should run discovery multiple times if multiple blocks with the same timestamp', async () => {
      const config = mockConfig()
      const chainId = ChainId.ETHEREUM
      const BLOCKS = [
        mockBlock({ blockNumber: 1, timestamp: new UnixTime(1000) }),
        mockBlock({ blockNumber: 2, timestamp: new UnixTime(1000) }),
        mockBlock({ blockNumber: 3, timestamp: new UnixTime(2000) }),
      ] as const
      const fakeBlockRepo = mockBlockNumberRepository([...BLOCKS])
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const eventRepo = mockObject<EventRepository>({
        getSortedInRange: async () =>
          BLOCKS.map((x) => ({
            chainId: x.chainId,
            blockNumber: x.blockNumber,
          })),
      })
      const discoveryRepo = mockObject<DiscoveryRepository>({
        add: async () => true,
      })

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        fakeBlockRepo,
        eventRepo,
        discoveryRepo,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await discoveryIndexer.update(1000, 2000)).toEqual(1000)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(2)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(
        1,
        config,
        BLOCKS[0].blockNumber,
      )
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(
        2,
        config,
        BLOCKS[1].blockNumber,
      )
      expect(discoveryRepo.add).toHaveBeenCalledTimes(2)
    })
  })

  describe(DiscoveryIndexer.prototype.invalidate.name, () => {
    it('should delete the records after targetHeight', async () => {
      const chainId = ChainId.ETHEREUM
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        deleteAfter: async () => 1,
      })
      const BLOCK_10 = mockBlock({ blockNumber: 10 })

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => BLOCK_10,
        }),
        mockObject<EventRepository>(),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await discoveryIndexer.invalidate(1000)).toEqual(
        BLOCK_10.timestamp.toNumber(),
      )
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
      expect(discoveryRepository.deleteAfter).toHaveBeenCalledTimes(1)
      expect(discoveryRepository.deleteAfter).toHaveBeenNthCalledWith(
        1,
        BLOCK_10.blockNumber,
        chainId,
      )
    })

    it('should run on empty repository', async () => {
      const discoveryIndexer = new DiscoveryIndexer(
        mockObject<DiscoveryEngine>(),
        mockConfig(),
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => undefined,
        }),
        mockObject<EventRepository>(),
        mockObject<DiscoveryRepository>({
          deleteAfter: async () => 1,
        }),
        mockObject<IndexerStateRepository>(),
        ChainId.ETHEREUM,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      await discoveryIndexer.invalidate(0)
    })
  })
})

function mockConfig() {
  const configHash = Hash256.random()

  return mockObject<DiscoveryConfig>({
    name: 'test',
    chainId: ChainId.ETHEREUM,
    hash: configHash,
  })
}

function mockBlock(block: Partial<BlockNumberRecord>) {
  return {
    blockNumber: 1,
    blockHash: Hash256.random(),
    timestamp: new UnixTime(1),
    chainId: ChainId.ETHEREUM,
    ...block,
  }
}
