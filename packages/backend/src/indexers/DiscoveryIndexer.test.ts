import { Logger } from '@l2beat/backend-tools'
import { DiscoveryConfig, DiscoveryEngine } from '@l2beat/discovery'
import { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'
import { DiscoveryIndexer } from './DiscoveryIndexer'

describe(DiscoveryIndexer.name, () => {
  describe(DiscoveryIndexer.prototype.update.name, () => {
    it('should run discovery on the latest block', async () => {
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
        hasOutputChanged: async () => false,
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        addOrUpdate: async () => true,
        findAtOrBefore: async () => undefined,
      })
      const chainId = ChainId.ETHEREUM

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => mockBlock(1),
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await discoveryIndexer.update(0, 1)).toEqual(1)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(1, config, 1)
      expect(discoveryRepository.addOrUpdate).toHaveBeenNthCalledWith(1, {
        chainId,
        blockNumber: 1,
        discoveryOutput: {
          version: 3,
          name: 'test',
          configHash: config.hash,
          chain: 'ethereum',
          blockNumber: 1,
          contracts: [],
          eoas: [],
          abis: {},
        },
      })
    })

    it('should run hasOutputChanged if previous discovery exists', async () => {
      const config = mockConfig()
      const chainId = ChainId.ETHEREUM
      const prevDiscovery = {
        chainId,
        blockNumber: 1,
        discoveryOutput: mockObject<DiscoveryOutput>({
          version: 3,
        }),
      }
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
        hasOutputChanged: async () => false,
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        addOrUpdate: async () => true,
        findAtOrBefore: async () => prevDiscovery,
      })

      const disocoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => mockBlock(1),
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await disocoveryIndexer.update(1, 2)).toEqual(2)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
      expect(discoveryRepository.addOrUpdate).not.toHaveBeenCalled()
      expect(discoveryEngine.hasOutputChanged).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.hasOutputChanged).toHaveBeenCalledWith(
        config,
        prevDiscovery.discoveryOutput,
        1,
      )
    })
  })

  describe(DiscoveryIndexer.prototype.invalidate.name, () => {
    it('should not run discovery on the targetHeight', async () => {
      const chainId = ChainId.ETHEREUM
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        addOrUpdate: async () => true,
      })
      const BLOCK_NUMBER = 10

      const discoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => mockBlock(BLOCK_NUMBER),
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<CacheInvalidationIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await discoveryIndexer.invalidate(1000)).toEqual(1000)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(0)
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

function mockBlock(number: number) {
  return {
    blockNumber: number,
    blockHash: Hash256.random(),
    timestamp: new UnixTime(1),
    chainId: ChainId.ETHEREUM,
  }
}
