import { assert } from '@l2beat/backend-tools'
import { ChainId, ChangelogApi, EthereumAddress } from '@lz/libs'

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

    return changelog.sort((a, b) => b.blockNumber - a.blockNumber)
  }
}
