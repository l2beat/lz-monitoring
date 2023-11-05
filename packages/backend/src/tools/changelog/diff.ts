import { ContractParameters } from '@l2beat/discovery-types'
import diff from 'deep-diff'

import { FieldDifference } from './types'

export { diffContractValues }

function diffContractValues(
  firstContractValues: NonNullable<ContractParameters['values']>,
  secondContractValues: NonNullable<ContractParameters['values']>,
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
