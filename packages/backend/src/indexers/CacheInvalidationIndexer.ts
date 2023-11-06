import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ProviderCacheRepository } from '../peripherals/database/ProviderCacheRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'

export class CacheInvalidationIndexer extends ChildIndexer {
  private readonly id = 'CacheInvalidationIndexer'
  constructor(
    private readonly cacheRepository: ProviderCacheRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    logger: Logger,
    blockNumberIndexer: BlockNumberIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [blockNumberIndexer])
  }

  async update(_fromBlock: number, toBlock: number): Promise<number> {
    // NOOP
    return Promise.resolve(toBlock)
  }

  override async invalidate(targetHeight: number): Promise<number> {
    if (targetHeight === 0) {
      this.logger.warn(
        'Invalidation signal received for height 0 - ignoring to prevent cache wipe',
      )
      return targetHeight
    }

    await this.cacheRepository.deleteAfter(targetHeight, this.chainId)
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
