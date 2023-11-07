import { assert } from '@l2beat/backend-tools'
import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress } from '@lz/libs'
import diff from 'deep-diff'

import { groupContracts } from './grouping'
import {
  ChangelogEntry,
  FieldDifference,
  SmartContractOperation,
} from './types'

export {
  changelogEntryToFieldDiff,
  diffContractValues,
  fieldDiffToChangelogEntry,
  getDiscoveryChanges,
}

function getDiscoveryChanges(
  previousOutput: DiscoveryOutput,
  currentOutput: DiscoveryOutput,
): {
  modified: ChangelogEntry[]
  removed: ChangelogEntry[]
  added: ChangelogEntry[]
} {
  const { modified, removed, added } = groupContracts(
    previousOutput,
    currentOutput,
  )

  const removedChangelogEntries = removed.flatMap((contract) => {
    // Diff values against empty object to get all removed fields
    const valuesDiff = diffContractValues(contract.values, {})

    return valuesDiff.map((valueDifference) =>
      fieldDiffToChangelogEntry(valueDifference, {
        contractName: contract.name,
        contractAddress: contract.address,
        blockNumber: currentOutput.blockNumber,
        chainName: currentOutput.chain,
        operation: 'REMOVE_CONTRACT',
      }),
    )
  })

  const addedChangelogEntries = added.flatMap((contract) => {
    // Diff values against empty object to get all added fields
    const valuesDiff = diffContractValues({}, contract.values)

    return valuesDiff.map((valueDifference) =>
      fieldDiffToChangelogEntry(valueDifference, {
        contractName: contract.name,
        contractAddress: contract.address,
        blockNumber: currentOutput.blockNumber,
        chainName: currentOutput.chain,
        operation: 'ADD_CONTRACT',
      }),
    )
  })

  const changelogEntries = modified.flatMap(
    ([previousContract, currentContract]) => {
      const fieldDifferences = diffContractValues(
        previousContract.values,
        currentContract.values,
      )

      if (fieldDifferences.length === 0) {
        // Flat map
        return []
      }

      return fieldDifferences.map((valueDifference) =>
        fieldDiffToChangelogEntry(valueDifference, {
          contractName: currentContract.name,
          contractAddress: currentContract.address,
          blockNumber: currentOutput.blockNumber,
          chainName: currentOutput.chain,
          operation: 'MODIFY_CONTRACT',
        }),
      )
    },
  )

  return {
    modified: changelogEntries,
    removed: removedChangelogEntries,
    added: addedChangelogEntries,
  }
}

function diffContractValues(
  firstContractValues: ContractParameters['values'],
  secondContractValues: ContractParameters['values'],
): FieldDifference[] {
  const differences = diff(firstContractValues, secondContractValues)

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
  return Array.isArray(path) ? path.map((key) => key.toString()) : []
}

function fieldDiffToChangelogEntry(
  fieldDiff: FieldDifference,
  context: {
    operation: SmartContractOperation
    contractName: string
    contractAddress: EthereumAddress
    blockNumber: number
    chainName: string
  },
): ChangelogEntry {
  assert(fieldDiff.key[0], 'no property path')

  return {
    targetName: context.contractName,
    targetAddress: context.contractAddress,
    chainId: ChainId.fromName(context.chainName),
    blockNumber: context.blockNumber,
    operation: context.operation,
    type: fieldDiff.modificationType,
    parameterName: fieldDiff.key[0],
    parameterPath: fieldDiff.key,
    previousValue: fieldDiff.previous,
    currentValue: fieldDiff.current,
  }
}

function changelogEntryToFieldDiff(
  changelogEntry: ChangelogEntry,
): FieldDifference {
  return {
    key: changelogEntry.parameterPath,
    modificationType: changelogEntry.type,
    previous: changelogEntry.previousValue,
    current: changelogEntry.currentValue,
    // Changelog Entry is dummy fallback, there is no type discrimination
  } as FieldDifference
}