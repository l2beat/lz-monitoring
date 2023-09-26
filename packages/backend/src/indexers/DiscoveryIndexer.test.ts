import { Logger } from '@l2beat/backend-tools'
import { DiscoveryConfig, DiscoveryEngine } from '@l2beat/discovery'
import { ChainId, Hash256 } from '@lz/libs'
import { expect, mockObject } from 'earl'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'
import { DiscoveryIndexer } from './DiscoveryIndexer'

describe(DiscoveryIndexer.name, () => {
  describe(DiscoveryIndexer.prototype.update.name, () => {
    it('should run discovery on the latest block', async () => {
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        addOrUpdate: async () => true,
      })
      const chainId = ChainId.ETHEREUM

      const disocoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => 1,
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<BlockNumberIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await disocoveryIndexer.update(0, 1)).toEqual(1)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(1, config, 1)
      expect(discoveryRepository.addOrUpdate).toHaveBeenNthCalledWith(1, {
        chainId,
        discoveryOutput: {
          version: 2,
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
          findAtOrBefore: async () => BLOCK_NUMBER,
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        chainId,
        Logger.SILENT,
        mockObject<BlockNumberIndexer>({
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
