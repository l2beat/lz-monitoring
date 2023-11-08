import { Logger } from '@l2beat/backend-tools'
import { DiscoveryConfig, DiscoveryEngine } from '@l2beat/discovery'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'

import { BlockNumberRecord } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'
import { DiscoveryIndexer } from './DiscoveryIndexer'
import { EventIndexer } from './EventIndexer'

describe(DiscoveryIndexer.name, () => {
  describe(DiscoveryIndexer.prototype.start.name, () => {
    it('should respect the config hash', async () => {
      const oldConfig = mockConfig()
      const newConfig = mockConfig()

      const indexerStateRepo = mockObject<IndexerStateRepository>({
        findById: async () => ({
          configHash: oldConfig.hash,
          id: 'id',
          chainId: ChainId.ETHEREUM,
          height: 100,
        }),
        addOrUpdate: async () => 'string',
      })

      const oldDiscoveryIndexer = new DiscoveryIndexer(
        mockObject<DiscoveryEngine>(),
        oldConfig,
        mockObject<EventRepository>(),
        mockObject<DiscoveryRepository>(),
        indexerStateRepo,
        ChainId.ETHEREUM,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      await expect(oldDiscoveryIndexer.start()).not.toBeRejected()
      expect(indexerStateRepo.addOrUpdate).not.toHaveBeenCalled()

      const newDiscoveryIndexer = new DiscoveryIndexer(
        mockObject<DiscoveryEngine>(),
        newConfig,
        mockObject<EventRepository>(),
        mockObject<DiscoveryRepository>(),
        indexerStateRepo,
        ChainId.ETHEREUM,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      await expect(newDiscoveryIndexer.start()).not.toBeRejected()
      expect(indexerStateRepo.addOrUpdate).toHaveBeenCalledTimes(1)
      expect(indexerStateRepo.addOrUpdate).toHaveBeenNthCalledWith(1, {
        id: 'DiscoveryIndexer',
        chainId: ChainId.ETHEREUM,
        height: 0,
        configHash: newConfig.hash,
      })
    })
  })

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
      const eventRepo = mockObject<EventRepository>({
        getSortedBlockNumbersInRange: async () => [BLOCK_100.blockNumber],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        add: async () => true,
        findAtOrBefore: async () => undefined,
      })

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
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
        BLOCK_100.blockNumber,
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
        getSortedBlockNumbersInRange: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        add: async () => true,
      })

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
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

      expect(await discoveryIndexer.update(1000, 2000)).toEqual(2000)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
      expect(discoveryRepository.add).not.toHaveBeenCalled()
      expect(eventRepo.getSortedBlockNumbersInRange).toHaveBeenCalledTimes(1)
      expect(eventRepo.getSortedBlockNumbersInRange).toHaveBeenNthCalledWith(
        1,
        1000,
        2000,
        chainId,
      )
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

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
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
      const invalidateTo = 1000
      expect(await discoveryIndexer.invalidate(invalidateTo)).toEqual(
        invalidateTo,
      )
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
      expect(discoveryRepository.deleteAfter).toHaveBeenCalledTimes(1)
      expect(discoveryRepository.deleteAfter).toHaveBeenNthCalledWith(
        1,
        invalidateTo,
        chainId,
      )
    })

    it('should run on empty repository', async () => {
      const discoveryIndexer = new DiscoveryIndexer(
        mockObject<DiscoveryEngine>(),
        mockConfig(),
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

      await expect(discoveryIndexer.invalidate(0)).not.toBeRejected()
    })
  })

  describe(DiscoveryIndexer.prototype.setSafeHeight.name, () => {
    it('should set the safe height and config hash', async () => {
      const chainId = ChainId.ETHEREUM
      const config = mockConfig()
      const newHeight = 100
      const indexerStateRepo = mockObject<IndexerStateRepository>({
        addOrUpdate: async () => 'string',
      })

      const discoveryIndexer = new DiscoveryIndexer(
        mockObject<DiscoveryEngine>(),
        config,
        mockObject<EventRepository>(),
        mockObject<DiscoveryRepository>(),
        indexerStateRepo,
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
        mockObject<EventIndexer>({
          subscribe: () => {},
        }),
      )

      await expect(discoveryIndexer.setSafeHeight(newHeight)).not.toBeRejected()
      expect(indexerStateRepo.addOrUpdate).toHaveBeenCalledTimes(1)
      expect(indexerStateRepo.addOrUpdate).toHaveBeenNthCalledWith(1, {
        id: 'DiscoveryIndexer',
        chainId,
        height: newHeight,
        configHash: config.hash,
      })
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
