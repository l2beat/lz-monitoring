import { assert } from '@l2beat/backend-tools'

import { getDiscoveryChanges } from './changes'
import { ChangelogEntry, MilestoneEntry } from './types'

export { createComparablePairs, flattenChanges }
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
  changelog: ChangelogEntry[]
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
    changelog: flattenProperties,
    milestones: flattenMilestones,
  }
}
