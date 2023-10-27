import { assert, Logger } from '@l2beat/backend-tools'
import { ChainId } from '@l2beat/discovery'
import { ChildIndexer } from '@l2beat/uif'
import { UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { DiscoveryIndexer } from './DiscoveryIndexer'

export class CurrentDiscoveryIndexer extends ChildIndexer {
  readonly id = 'CurrentDiscoveryIndexer'

  constructor(
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly currentDiscoveryRepository: CurrentDiscoveryRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    logger: Logger,
    discoveryIndexer: DiscoveryIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [discoveryIndexer])
  }

  async update(_fromTimestamp: number, toTimestamp: number): Promise<number> {
    const updatedTimestamp = await this.updateCurrentDiscovery(
      new UnixTime(toTimestamp),
    )
    return updatedTimestamp.toNumber()
  }

  async invalidate(targetTimestamp: number): Promise<number> {
    if (targetTimestamp === 0) {
      await this.currentDiscoveryRepository.deleteAll()
      return 0
    }

    const updatedTimestamp = await this.updateCurrentDiscovery(
      new UnixTime(targetTimestamp),
    )
    return updatedTimestamp.toNumber()
  }

  private async updateCurrentDiscovery(timestamp: UnixTime): Promise<UnixTime> {
    const blockRecord = await this.blockNumberRepository.findAtOrBefore(
      timestamp,
      this.chainId,
    )
    assert(blockRecord, 'No block number record found')
    const lastDiscovery = await this.discoveryRepository.findAtOrBefore(
      blockRecord.blockNumber,
      this.chainId,
    )
    assert(lastDiscovery, 'No discovery record found')
    await this.currentDiscoveryRepository.addOrUpdate({
      chainId: this.chainId,
      discoveryOutput: {
        ...lastDiscovery.discoveryOutput,
        blockNumber: blockRecord.blockNumber,
      },
    })

    return timestamp
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
