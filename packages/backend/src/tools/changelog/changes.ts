import { ChainId } from '@l2beat/discovery'
import { DiscoveryOutput } from '@l2beat/discovery-types'

import { groupContracts } from './grouping'
import { getMilestones } from './milestones'
import { getChangedProperties } from './properties'
import { ChangelogEntry, MilestoneEntry } from './types'

export { getDiscoveryChanges }

function getDiscoveryChanges(
  previousOutput: DiscoveryOutput,
  currentOutput: DiscoveryOutput,
): {
  properties: {
    modified: ChangelogEntry[]
    removed: ChangelogEntry[]
    added: ChangelogEntry[]
  }
  milestones: {
    added: MilestoneEntry[]
    removed: MilestoneEntry[]
  }
} {
  const { modified, removed, added } = groupContracts(
    previousOutput,
    currentOutput,
  )

  const changeContext = {
    blockNumber: currentOutput.blockNumber,
    chainId: ChainId.fromName(currentOutput.chain),
  }

  const milestones = getMilestones(
    {
      removed,
      added,
    },
    changeContext,
  )

  const properties = getChangedProperties(
    {
      added,
      removed,
      modified,
    },
    changeContext,
  )

  return {
    properties,
    milestones,
  }
}
