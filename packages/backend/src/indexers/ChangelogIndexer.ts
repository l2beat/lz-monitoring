import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
import { getDiscoveryChanges } from '../tools/changelog/changes'
import {
  createComparablePairs,
  flattenChanges,
} from '../tools/changelog/mappers'
import { DiscoveryIndexer } from './DiscoveryIndexer'

export class ChangelogIndexer extends ChildIndexer {
  private readonly id = 'ChangelogIndexer'
  constructor(
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly changelogRepository: ChangelogRepository,
    private readonly milestoneRepository: MilestoneRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly chainId: ChainId,

    discoveryIndexer: DiscoveryIndexer,
    logger: Logger,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [discoveryIndexer])
  }

  override async update(from: number, to: number): Promise<number> {
    const fromBlockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(from),
      this.chainId,
    )
    const fromBlockNumber = fromBlockRecord?.blockNumber ?? 0

    const toBlockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(to),
      this.chainId,
    )
    assert(toBlockRecord, 'toBlockNumber not found')

    const toBlockNumber = toBlockRecord.blockNumber

    const discovery = await this.discoveryRepository.getSortedInRange(
      fromBlockNumber,
      toBlockNumber,
      this.chainId,
    )

    if (discovery.length < 2) {
      // 0 records or 1 record we can't compare to anything
      return to
    }

    // If we start from the very beginning,
    // we don't have a previous discovery as a reference
    const referenceDiscovery =
      fromBlockNumber === 0
        ? null
        : await this.discoveryRepository.findAtOrBefore(
            fromBlockNumber,
            this.chainId,
          )

    if (fromBlockNumber !== 0) {
      assert(
        referenceDiscovery !== null,
        'referenceDiscovery not found despite further discoveries being present',
      )
    }

    const presentOutputs = discovery.map((d) => d.discoveryOutput)

    const outputsToCompare = referenceDiscovery
      ? [referenceDiscovery.discoveryOutput, ...presentOutputs]
      : presentOutputs

    const outputPairs = createComparablePairs(outputsToCompare)

    const changelogEntries = outputPairs.map(
      ([previousOutput, currentOutput]) =>
        getDiscoveryChanges(previousOutput, currentOutput),
    )

    const flatEntries = flattenChanges(changelogEntries)

    await this.changelogRepository.addMany(flatEntries.changelog)
    await this.milestoneRepository.addMany(flatEntries.milestones)

    return to
  }

  protected override async invalidate(targetHeight: number): Promise<number> {
    const blockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(targetHeight),
      this.chainId,
    )
    const blockNumber = blockRecord?.blockNumber ?? 0

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
