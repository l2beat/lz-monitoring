import { assert } from '@l2beat/backend-tools'
import { DiscoveryOutput } from '@l2beat/discovery-types'
import { EthereumAddress } from '@lz/libs'

import { getDiscoveryChanges } from './changes'
import { ChangelogEntry, MilestoneEntry } from './types'

export { applyChangelogWhitelist, createComparablePairs, flattenChanges }
/**
 * Convert outputs to comparable pairs
 * @code
 * ```ts
 * [D1,D2,D3,D4] -> [[D1,D2],[D2,D3],[D3,D4]]
 * ```
 */
function createComparablePairs<T>(outputs: T[]): [T, T][] {
  assert(outputs.length > 1, 'Not enough items to pair')

  const pairs: [T, T][] = []

  for (let i = 1; i < outputs.length; i++) {
    assert(outputs[i - 1] && outputs[i], 'Invalid outputs given to pair')
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pairs.push([outputs[i - 1]!, outputs[i]!])
  }

  return pairs
}

function flattenChanges(groups: ReturnType<typeof getDiscoveryChanges>[]): {
  properties: ChangelogEntry[]
  milestones: MilestoneEntry[]
} {
  const flattenProperties = groups
    .map((group) => group.properties)
    .reduce<ChangelogEntry[]>((acc, { added, modified, removed }) => {
      return acc.concat(added, modified, removed)
    }, [])

  const flattenMilestones = groups
    .map((group) => group.milestones)
    .reduce<MilestoneEntry[]>((acc, { added, removed }) => {
      return acc.concat(added, removed)
    }, [])

  return {
    properties: flattenProperties,
    milestones: flattenMilestones,
  }
}

function applyChangelogWhitelist(
  output: DiscoveryOutput,
  whitelist: EthereumAddress[],
): DiscoveryOutput {
  return {
    ...output,
    contracts: output.contracts.filter((contract) =>
      whitelist.some(
        (whitelistedAddress) => whitelistedAddress === contract.address,
      ),
    ),
  }
}
