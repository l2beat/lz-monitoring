import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ProviderCacheRepository } from '../peripherals/database/ProviderCacheRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'

export class CacheInvalidationIndexer extends ChildIndexer {
  private readonly id = 'CacheInvalidationIndexer'
  constructor(
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly cacheRepository: ProviderCacheRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    logger: Logger,
    blockNumberIndexer: BlockNumberIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [blockNumberIndexer])
  }

  async update(_fromTimestamp: number, toTimestamp: number): Promise<number> {
    // NOOP
    return Promise.resolve(toTimestamp)
  }

  override async invalidate(targetHeight: number): Promise<number> {
    if (targetHeight === 0) {
      this.logger.warn(
        'Invalidation signal received for height 0 - ignoring to prevent cache wipe',
      )
      return targetHeight
    }

    const blockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(targetHeight),
      this.chainId,
    )

    // Maybe we should do a full cache wipe? This should never happen provided indexers were
    // running for some time and the database is not empty.
    // If this happens, we are probably at the very beginning or have data integrity issues
    assert(blockRecord, 'Referenced block not found')

    await this.cacheRepository.deleteAfter(
      blockRecord.blockNumber,
      this.chainId,
    )

    return targetHeight
  }

  async getSafeHeight(): Promise<number> {
    const state = await this.indexerStateRepository.findById(
      this.id,
      this.chainId,
    )

    return state?.height ?? 0
  }

  async setSafeHeight(height: number): Promise<void> {
    await this.indexerStateRepository.addOrUpdate({
      id: this.id,
      height,
      chainId: this.chainId,
    })
  }
}
