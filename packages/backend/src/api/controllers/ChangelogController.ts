import { assert } from '@l2beat/backend-tools'
import {
  ChainId,
  Change,
  ChangelogApi,
  ChangelogApiEntry,
  ChangelogCategory,
  EthereumAddress,
  Milestone,
  UnixTime,
} from '@lz/libs'

import {
  ChangelogRepository,
  FullChangelogRecord,
} from '../../peripherals/database/ChangelogRepository'
import { MilestoneRepository } from '../../peripherals/database/MilestoneRepository'

export class ChangelogController {
  constructor(
    private readonly changelogRepository: ChangelogRepository,
    private readonly milestoneRepository: MilestoneRepository,
  ) {}

  async getChangelog(
    chainId: ChainId,
    contract: EthereumAddress,
  ): Promise<ChangelogApi> {
    const fullChangelog = await this.changelogRepository.getFullChangelog(
      chainId,
      contract,
    )
    const fullMilestones = await this.milestoneRepository.getByChainByAddress(
      chainId,
      contract,
    )

    const milestonesMap = new Map<number, Milestone>()
    for (const entry of fullMilestones) {
      milestonesMap.set(entry.blockNumber, {
        operation: entry.operation,
      })
    }

    const changesPerBlock = new Map<number, Change[]>()
    for (const entry of fullChangelog) {
      const milestone = milestonesMap.get(entry.blockNumber)
      const category = getCategory(entry, milestone)
      const change = {
        category,
        modificationType: entry.modificationType,
        parameterPath: entry.parameterPath,
        previousValue: entry.previousValue,
        currentValue: entry.currentValue,
      }
      const changes = changesPerBlock.get(entry.blockNumber)
      if (!changes) {
        changesPerBlock.set(entry.blockNumber, [change])
        continue
      }
      changes.push(change)
    }

    const changelog = []
    for (const [blockNumber, changes] of changesPerBlock) {
      const fullChanges = fullChangelog.filter(
        (x) => x.blockNumber === blockNumber,
      )
      assert(fullChanges.length > 0, 'Timestamp and txHash not found')
      changelog.push({
        blockNumber,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        timestamp: fullChanges[0]!.timestamp,
        possibleTxHashes: fullChanges
          .map((x) => x.txHash)
          .filter((x, i, a) => a.indexOf(x) === i),
        changes,
      })
    }
    const sortedChangelog = changelog.sort(
      (a, b) => a.blockNumber - b.blockNumber,
    )
    const perDay = getChangesPerDay(sortedChangelog)
    const availableYears = getAvailableYears(perDay)
    const startTimestamp = perDay[0]?.timestamp ?? null
    assert(startTimestamp, 'startTimestamp not found')

    return {
      perDay,
      availableYears,
      startTimestamp,
    }
  }
}

/**
 * This function is a heuristic that helps us to determine
 * the category of a change. Any change in our config will
 * require changing this function logic.
 */
function getCategory(
  entry: FullChangelogRecord,
  milestone?: Milestone,
): ChangelogCategory {
  if (milestone) {
    // WE ASSUME THAT THE ONLY MILESTONE IS CONTRACT_ADDED
    assert(milestone.operation === 'CONTRACT_ADDED')
    return milestone.operation
  }

  const remotePaths = [
    'ulnLookup',
    'defaultAppConfig',
    'defaultAdapterParams',
    'inboundProofLibrary',
    'supportedOutboundProof',
  ]

  if (!entry.parameterPath.some((x) => remotePaths.includes(x))) {
    return 'OTHER'
  }

  if (entry.modificationType === 'OBJECT_NEW_PROPERTY') {
    return 'REMOTE_ADDED'
  }

  return 'REMOTE_CHANGED'
}

function getChangesPerDay(
  changes: ChangelogApiEntry[],
): { timestamp: UnixTime; perBlock: ChangelogApiEntry[] }[] {
  const changelogPerDay = new Map<number, ChangelogApiEntry[]>()
  changes.forEach((change) => {
    const day = change.timestamp.toStartOf('day').toNumber()
    const changes = changelogPerDay.get(day)
    if (!changes) {
      changelogPerDay.set(day, [change])
      return
    }
    changes.push(change)
  })
  const result = []
  for (const [day, changes] of changelogPerDay) {
    result.push({
      timestamp: new UnixTime(day),
      perBlock: changes,
    })
  }
  return result.sort((a, b) => a.timestamp.toNumber() - b.timestamp.toNumber())
}

function getAvailableYears(
  getChangesPerDay: { timestamp: UnixTime; perBlock: ChangelogApiEntry[] }[],
): number[] {
  // return array of all years from the first year with changes
  // to the current year
  const currentYear = new Date().getUTCFullYear()
  const firstYear = getChangesPerDay[0]?.timestamp.toDate().getUTCFullYear()
  if (!firstYear) {
    return []
  }
  const years = []
  for (let year = currentYear; year >= firstYear; year--) {
    years.push(year)
  }
  return years
}
