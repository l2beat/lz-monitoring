import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
import { getDiscoveryChanges } from '../tools/changelog/diff'
import { ChangelogEntry, MilestoneEntry } from '../tools/changelog/types'
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

    const referenceDiscovery = await this.discoveryRepository.findAtOrBefore(
      fromBlockNumber - 1, // To catch previous one
      this.chainId,
    )

    assert(
      referenceDiscovery,
      'referenceDiscovery not found despite further discoveries being present',
    )

    const discoveries = [
      referenceDiscovery.discoveryOutput,
      ...discovery.map((d) => d.discoveryOutput),
    ]

    const comparablePairs = createComparablePairs(discoveries)

    const changelogEntries = comparablePairs.map(
      ([previousOutput, currentOutput]) =>
        getDiscoveryChanges(previousOutput, currentOutput),
    )

    // FIXME: Fix this mess
    const flatEntries = changelogEntries
      .map(flatGroups)
      .map((c) => c.changelog)
      .flat()
    const flatMilestones = changelogEntries
      .map(flatGroups)
      .map((c) => c.milestones)
      .flat()

    await this.changelogRepository.addMany(flatEntries)
    await this.milestoneRepository.addMany(flatMilestones)

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

/**
 * Convert outputs to comparable pairs
 * @code
 * ```ts
 * [D1,D2,D3,D4] -> [[D1,D2],[D2,D3],[D3,D4]]
 * ```
 */
function createComparablePairs<T>(outputs: T[]): [T, T][] {
  const pairs: [T, T][] = []

  for (let i = 1; i <= outputs.length - 1; i++) {
    pairs.push([outputs[i - 1]!, outputs[i]!])
  }

  return pairs
}

function flatGroups(groups: ReturnType<typeof getDiscoveryChanges>): {
  changelog: ChangelogEntry[]
  milestones: MilestoneEntry[]
} {
  const flatChangelogEntries = [
    groups.properties.added,
    groups.properties.modified,
    groups.properties.removed,
  ].flat()

  const flatMilestoneEntries = [
    groups.milestones.added,
    groups.milestones.removed,
  ].flat()

  return {
    changelog: flatChangelogEntries,
    milestones: flatMilestoneEntries,
  }
}
