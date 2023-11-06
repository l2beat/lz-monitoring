import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, EthereumAddress } from '@lz/libs'

import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
import {
  getComparableGenesisReference,
  getDiscoveryChanges,
} from '../tools/changelog/changes'
import {
  applyChangelogWhitelist,
  createComparablePairs,
  flattenChanges,
} from '../tools/changelog/mappers'
import { DiscoveryIndexer } from './DiscoveryIndexer'

export class ChangelogIndexer extends ChildIndexer {
  private readonly id = 'ChangelogIndexer'
  constructor(
    private readonly changelogRepository: ChangelogRepository,
    private readonly milestoneRepository: MilestoneRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly chainId: ChainId,
    private readonly changelogWhitelist: EthereumAddress[],
    discoveryIndexer: DiscoveryIndexer,
    logger: Logger,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [discoveryIndexer])
  }

  override async update(from: number, to: number): Promise<number> {
    const fromBlockNumber = from

    const toBlockNumber = to

    const discovery = await this.discoveryRepository.getSortedInRange(
      fromBlockNumber,
      toBlockNumber,
      this.chainId,
    )

    // 0 records - we can't compare to anything
    if (discovery.length === 0) {
      return to
    }

    // If we start from the very beginning,
    // we don't have a previous discovery as a reference
    const referenceDiscoveryOutput =
      fromBlockNumber === 0
        ? getComparableGenesisReference(this.chainId)
        : (
            await this.discoveryRepository.findAtOrBefore(
              fromBlockNumber,
              this.chainId,
            )
          )?.discoveryOutput

    assert(
      referenceDiscoveryOutput,
      'Reference discovery not found for non-genesis comparison',
    )

    const presentOutputs = discovery.map((d) => d.discoveryOutput)

    const outputsToCompare = [referenceDiscoveryOutput, ...presentOutputs]

    const whitelistedOutputs = outputsToCompare.map((output) =>
      applyChangelogWhitelist(output, this.changelogWhitelist),
    )

    const outputPairs = createComparablePairs(whitelistedOutputs)

    const changes = outputPairs.map(([previousOutput, currentOutput]) =>
      getDiscoveryChanges(previousOutput, currentOutput),
    )

    const flatChanges = flattenChanges(changes)

    await this.changelogRepository.addMany(flatChanges.properties)
    await this.milestoneRepository.addMany(flatChanges.milestones)

    return to
  }

  protected override async invalidate(targetHeight: number): Promise<number> {
    const blockNumber = targetHeight

    await this.changelogRepository.deleteAfter(blockNumber, this.chainId)
    await this.milestoneRepository.deleteAfter(blockNumber, this.chainId)

    return targetHeight
  }

  override async getSafeHeight(): Promise<number> {
    const indexerState = await this.indexerStateRepository.findById(
      this.id,
      this.chainId,
    )
    return indexerState?.height ?? 0
  }

  override async setSafeHeight(height: number): Promise<void> {
    await this.indexerStateRepository.addOrUpdate({
      id: this.id,
      chainId: this.chainId,
      height,
    })
  }
}
