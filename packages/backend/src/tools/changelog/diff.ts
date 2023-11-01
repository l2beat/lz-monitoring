import { assert } from '@l2beat/backend-tools'
import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId } from '@lz/libs'
import diff from 'deep-diff'

import { getMatchingContractPairs, splitSafeContractPairs } from './pairs'
import { ChangelogEntry, FieldDifference } from './types'

export { diffContractValues, getDiscoveryChanges }

function getDiscoveryChanges(
  firstOutput: DiscoveryOutput,
  secondOutput: DiscoveryOutput,
): ChangelogEntry[] {
  const matchingPairs = getMatchingContractPairs(firstOutput, secondOutput)

  const { safe: safePairs } = splitSafeContractPairs(matchingPairs)

  const changelogEntries = safePairs.flatMap(
    ([firstContract, secondContract]) => {
      const fieldDifferences = diffContractValues(
        firstContract.values,
        secondContract.values,
      )

      if (fieldDifferences.length === 0) {
        return []
      }

      return fieldDifferences.map((valueDifference) => {
        assert(valueDifference.key[0])

        return {
          targetName: secondContract.name,
          targetAddress: secondContract.address,
          chainId: ChainId.fromName(secondOutput.chain),
          blockNumber: secondOutput.blockNumber,
          type: valueDifference.modificationType,
          parameterName: valueDifference.key[0],
          parameterPath: valueDifference.key,
          previousValue: valueDifference.previous,
          currentValue: valueDifference.current,
        }
      })
    },
  )

  return changelogEntries
}

function diffContractValues(
  firstContractValues: ContractParameters['values'],
  secondContract: ContractParameters['values'],
): FieldDifference[] {
  const differences = diff(firstContractValues, secondContract)

  if (!differences) {
    return []
  }

  const fieldDifferences: FieldDifference[] = []

  for (const difference of differences) {
    switch (difference.kind) {
      case 'N':
        fieldDifferences.push({
          key: pathToKey(difference.path),
          previous: null,
          current: JSON.stringify(difference.rhs),
          modificationType: 'OBJECT_NEW_PROPERTY',
        })
        break

      case 'D':
        fieldDifferences.push({
          key: pathToKey(difference.path),
          previous: JSON.stringify(difference.lhs),
          current: null,
          modificationType: 'OBJECT_DELETED_PROPERTY',
        })
        break

      case 'E':
        fieldDifferences.push({
          key: pathToKey(difference.path),
          previous: JSON.stringify(difference.lhs),
          current: JSON.stringify(difference.rhs),
          modificationType: 'OBJECT_EDITED_PROPERTY',
        })
        break

      case 'A':
        {
          const key = pathToKey(difference.path).concat([
            difference.index.toString(),
          ])

          if (difference.item.kind === 'N') {
            fieldDifferences.push({
              key,
              previous: null,
              current: JSON.stringify(difference.item.rhs),
              modificationType: 'ARRAY_NEW_ELEMENT',
            })
          }

          if (difference.item.kind === 'D') {
            fieldDifferences.push({
              key,
              previous: JSON.stringify(difference.item.lhs),
              current: null,
              modificationType: 'ARRAY_DELETED_ELEMENT',
            })
          }

          if (difference.item.kind === 'E') {
            fieldDifferences.push({
              key,
              previous: JSON.stringify(difference.item.lhs),
              current: JSON.stringify(difference.item.lhs),
              modificationType: 'ARRAY_EDITED_ELEMENT',
            })
          }
        }

        break
    }
  }

  return fieldDifferences
}

function pathToKey(path?: string[]): string[] {
  return Array.isArray(path) ? path : []
}
