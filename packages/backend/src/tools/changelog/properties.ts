import { assert } from '@l2beat/backend-tools'
import { ContractParameters } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress } from '@lz/libs'

import { diffContractValues } from './diff'
import { ChangelogEntry, ContractPair, FieldDifference } from './types'

export {
  changelogEntryToFieldDiff,
  fieldDiffToChangelogEntry,
  getChangedProperties,
}

function getChangedProperties(
  contracts: {
    added: ContractParameters[]
    removed: ContractParameters[]
    modified: ContractPair[]
  },
  context: { chainId: ChainId; blockNumber: number },
): {
  added: ChangelogEntry[]
  removed: ChangelogEntry[]
  modified: ChangelogEntry[]
} {
  const removedProperties = contracts.removed.flatMap((contract) => {
    if (!contract.values) {
      return []
    }
    // Diff values against empty object to get all removed fields
    const valuesDiff = diffContractValues(contract.values, {})

    return valuesDiff.map((valueDifference) =>
      fieldDiffToChangelogEntry(valueDifference, {
        contractName: contract.name,
        contractAddress: contract.address,
        blockNumber: context.blockNumber,
        chainId: context.chainId,
      }),
    )
  })

  const addedProperties = contracts.added.flatMap((contract) => {
    if (!contract.values) {
      return []
    }
    // Diff values against empty object to get all added fields
    const valuesDiff = diffContractValues({}, contract.values)

    return valuesDiff.map((valueDifference) =>
      fieldDiffToChangelogEntry(valueDifference, {
        contractName: contract.name,
        contractAddress: contract.address,
        blockNumber: context.blockNumber,
        chainId: context.chainId,
      }),
    )
  })

  const modifiedProperties = contracts.modified.flatMap(
    ([previousContract, currentContract]) => {
      // FIXME: Double check
      if (!previousContract.values || !currentContract.values) {
        return []
      }

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
          blockNumber: context.blockNumber,
          chainId: context.chainId,
        }),
      )
    },
  )

  return {
    added: addedProperties,
    removed: removedProperties,
    modified: modifiedProperties,
  }
}

function fieldDiffToChangelogEntry(
  fieldDiff: FieldDifference,
  context: {
    contractName: string
    contractAddress: EthereumAddress
    blockNumber: number
    chainId: ChainId
  },
): ChangelogEntry {
  assert(fieldDiff.key[0], 'no property path')

  return {
    targetName: context.contractName,
    targetAddress: context.contractAddress,
    chainId: context.chainId,
    blockNumber: context.blockNumber,
    modificationType: fieldDiff.modificationType,
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
    modificationType: changelogEntry.modificationType,
    previous: changelogEntry.previousValue,
    current: changelogEntry.currentValue,
    // Changelog Entry is dummy fallback, there is no type discrimination
  } as FieldDifference
}
