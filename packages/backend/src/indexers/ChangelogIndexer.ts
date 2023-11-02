import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
import { getDiscoveryChanges } from '../tools/changelog/diff'
import { ChangelogEntry } from '../tools/changelog/types'
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
    // Issues is that we might skip discoveries here
    /**
     * @FIXME
     *     ______________ we are here and we need D1 even tough it is out of bounds
     * D1 | D2 | D3 | D4 |
     */
    const discovery = await this.discoveryRepository.getSortedInRange(
      from,
      to,
      this.chainId,
    )

    if (discovery.length < 2) {
      // 0 records or 1 record we can't compare to anything
      return to
    }

    const comparablePairs = createComparablePairs(
      discovery.map((d) => d.discoveryOutput),
    )

    const changelogEntries = comparablePairs.map(
      ([previousOutput, currentOutput]) =>
        getDiscoveryChanges(previousOutput, currentOutput),
    )

    const flatEntries = changelogEntries.map(flatGroups).flat()

    const flatMilestones = changelogEntries
      .map((e) => [e.milestones.added, e.milestones.removed].flat())
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

function flatGroups(
  groups: ReturnType<typeof getDiscoveryChanges>,
): ChangelogEntry[] {
  return [groups.added, groups.modified, groups.removed].reduce(
    (acc, group) => {
      return acc.concat(group)
    },
  )
}
