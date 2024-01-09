import { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, Hash256 } from '@lz/libs'

import { groupContracts } from './grouping'
import { getMilestones } from './milestones'
import { getChangedProperties } from './properties'
import { ChangelogEntry, MilestoneEntry } from './types'

export { getComparableGenesisReference, getDiscoveryChanges }

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

/**
 * We run discovery only for certain blocks.
 * First discovery is made at the block where some parts of the protocol already exist.
 * To obtain changes (mainly contract creations and initial properties) we need to have some basic, plain reference to perform comparison to.
 * Such genesis must be as empty as possible.
 * We only care about name, chain and contracts since those are critical for comparison - the rest is irrelevant.
 */
function getComparableGenesisReference(chainId: ChainId): DiscoveryOutput {
  return {
    name: 'layerzero',
    chain: ChainId.getName(chainId),
    blockNumber: 0,
    contracts: [],
    version: 0,
    configHash: Hash256.random(),
    eoas: [],
    abis: [] as unknown as DiscoveryOutput['abis'],
  }
}
