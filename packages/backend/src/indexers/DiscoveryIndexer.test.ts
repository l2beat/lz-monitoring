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

      const disocoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => 1,
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        Logger.SILENT,
        mockObject<BlockNumberIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await disocoveryIndexer.update(0, 1)).toEqual(1)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(1, config, 1)
      expect(discoveryRepository.addOrUpdate).toHaveBeenNthCalledWith(1, {
        discoveryOutput: {
          version: 2,
          name: 'test',
          configHash: configHash,
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
    it('should run discovery on the targetHeight', async () => {
      const config = mockConfig()
      const discoveryEngine = mockObject<DiscoveryEngine>({
        discover: async () => [],
      })
      const discoveryRepository = mockObject<DiscoveryRepository>({
        addOrUpdate: async () => true,
      })
      const BLOCK_NUMBER = 10

      const disocoveryIndexer = new DiscoveryIndexer(
        discoveryEngine,
        config,
        mockObject<BlockNumberRepository>({
          findAtOrBefore: async () => BLOCK_NUMBER,
        }),
        discoveryRepository,
        mockObject<IndexerStateRepository>(),
        Logger.SILENT,
        mockObject<BlockNumberIndexer>({
          subscribe: () => {},
        }),
      )

      expect(await disocoveryIndexer.invalidate(1000)).toEqual(1000)
      expect(discoveryEngine.discover).toHaveBeenCalledTimes(1)
      expect(discoveryEngine.discover).toHaveBeenNthCalledWith(
        1,
        config,
        BLOCK_NUMBER,
      )
      expect(discoveryRepository.addOrUpdate).toHaveBeenCalledTimes(1)
      expect(discoveryRepository.addOrUpdate).toHaveBeenNthCalledWith(1, {
        discoveryOutput: {
          version: 2,
          name: 'test',
          configHash: configHash,
          chain: 'ethereum',
          blockNumber: BLOCK_NUMBER,
          contracts: [],
          eoas: [],
          abis: {},
        },
      })
    })
  })
})
const configHash = Hash256.random()
function mockConfig() {
  return mockObject<DiscoveryConfig>({
    name: 'test',
    chainId: ChainId.ETHEREUM,
    hash: configHash,
  })
}
