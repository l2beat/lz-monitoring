import { assert } from '@l2beat/backend-tools'
import {
  ChainId,
  ChangelogApi,
  ChangelogApiEntry,
  EthereumAddress,
  UnixTime,
} from '@lz/libs'

import { ChangelogRepository } from '../../peripherals/database/ChangelogRepository'

export class ChangelogController {
  constructor(private readonly changelogRepository: ChangelogRepository) {}

  async getChangelog(
    chainId: ChainId,
    contract: EthereumAddress,
  ): Promise<ChangelogApi> {
    const fullChangelog = await this.changelogRepository.getFullChangelog(
      chainId,
      contract,
    )

    const changesMap = new Map<
      number,
      {
        parameterPath: string[]
        previousValue: string | null
        currentValue: string | null
      }[]
    >()

    for (const entry of fullChangelog) {
      const change = changesMap.get(entry.blockNumber)
      if (!change) {
        changesMap.set(entry.blockNumber, [
          {
            parameterPath: entry.parameterPath,
            previousValue: entry.previousValue,
            currentValue: entry.currentValue,
          },
        ])
        continue
      }
      change.push({
        parameterPath: entry.parameterPath,
        previousValue: entry.previousValue,
        currentValue: entry.currentValue,
      })
    }

    const changelog = []
    for (const [blockNumber, changes] of changesMap) {
      const timestamp = fullChangelog.find((x) => x.blockNumber === blockNumber)
        ?.timestamp
      assert(timestamp, 'Timestamp not found')
      changelog.push({
        blockNumber,
        timestamp,
        changes,
      })
    }
    const perDay = getChangesPerDay(changelog)
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
