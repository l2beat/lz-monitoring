import { Logger } from '@l2beat/backend-tools'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ProviderCacheRepository } from '../peripherals/database/ProviderCacheRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'

describe(CacheInvalidationIndexer.name, () => {
  describe(CacheInvalidationIndexer.prototype.invalidate.name, () => {
    it('should skip initial invalidation', async () => {
      const blockNumberRepository = mockObject<BlockNumberRepository>({})
      const cacheRepository = mockObject<ProviderCacheRepository>({
        deleteAfter: mockFn(),
      })
      const indexerStateRepository = mockObject<IndexerStateRepository>({})
      const chainId = ChainId.ETHEREUM
      const logger = Logger.SILENT
      const blockNumberIndexer = mockObject<BlockNumberIndexer>({
        subscribe: () => {},
      })
      const cacheInvalidationIndexer = new CacheInvalidationIndexer(
        blockNumberRepository,
        cacheRepository,
        indexerStateRepository,
        chainId,
        logger,
        blockNumberIndexer,
      )

      expect(await cacheInvalidationIndexer.invalidate(0)).toEqual(0)
      expect(cacheRepository.deleteAfter).not.toHaveBeenCalled()
    })

    it('remove blocks after given height', async () => {
      const BLOCK = {
        blockNumber: 1000,
        blockHash: Hash256.random(),
        timestamp: new UnixTime(10_000),
        chainId: ChainId.ETHEREUM,
      }

      const blockNumberRepository = mockObject<BlockNumberRepository>({
        findAtOrBefore: async () => BLOCK.blockNumber,
      })
      const cacheRepository = mockObject<ProviderCacheRepository>({
        deleteAfter: async () => 1, // Amount of blocks deleted, doesn't matter - given 3 blocks, 2 preserved, 1 deleted
      })
      const indexerStateRepository = mockObject<IndexerStateRepository>({})
      const chainId = ChainId.ETHEREUM
      const logger = Logger.SILENT
      const blockNumberIndexer = mockObject<BlockNumberIndexer>({
        subscribe: () => {},
      })

      const cacheInvalidationIndexer = new CacheInvalidationIndexer(
        blockNumberRepository,
        cacheRepository,
        indexerStateRepository,
        chainId,
        logger,
        blockNumberIndexer,
      )

      const targetHeight = BLOCK.blockNumber

      expect(await cacheInvalidationIndexer.invalidate(targetHeight)).toEqual(
        targetHeight,
      )
      expect(blockNumberRepository.findAtOrBefore).toHaveBeenCalledTimes(1)
      expect(blockNumberRepository.findAtOrBefore).toHaveBeenCalledWith(
        new UnixTime(targetHeight),
        chainId,
      )
      expect(cacheRepository.deleteAfter).toHaveBeenCalledTimes(1)
      expect(cacheRepository.deleteAfter).toHaveBeenCalledWith(
        BLOCK.blockNumber,
        chainId,
      )
    })
  })
})
