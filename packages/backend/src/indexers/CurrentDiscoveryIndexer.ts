import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { CurrentDiscoveryRepository } from '../peripherals/database/CurrentDiscoveryRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { DiscoveryIndexer } from './DiscoveryIndexer'

export class CurrentDiscoveryIndexer extends ChildIndexer {
  readonly id = 'CurrentDiscoveryIndexer'

  constructor(
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly currentDiscoveryRepository: CurrentDiscoveryRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    logger: Logger,
    discoveryIndexer: DiscoveryIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [discoveryIndexer])
  }

  async update(_fromBlock: number, toBlock: number): Promise<number> {
    const updatedBlock = await this.updateCurrentDiscovery(toBlock)
    return updatedBlock
  }

  async invalidate(targetBlock: number): Promise<number> {
    if (targetBlock === 0) {
      await this.currentDiscoveryRepository.deleteChain(this.chainId)
      return 0
    }

    const updatedBlock = await this.updateCurrentDiscovery(targetBlock)
    return updatedBlock
  }

  private async updateCurrentDiscovery(blockNumber: number): Promise<number> {
    const lastDiscovery = await this.discoveryRepository.findAtOrBefore(
      blockNumber,
      this.chainId,
    )
    assert(lastDiscovery, 'No discovery record found')
    await this.currentDiscoveryRepository.addOrUpdate({
      chainId: this.chainId,
      discoveryOutput: {
        ...lastDiscovery.discoveryOutput,
        blockNumber,
      },
    })

    return blockNumber
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
