import { ContractParameters } from '@l2beat/discovery-types'
import { expect } from 'earl'

import { diffContractValues } from './diff'
import { FieldDifference } from './types'

interface Case {
  desc: string
  prev: NonNullable<ContractParameters['values']>
  curr: NonNullable<ContractParameters['values']>
  expected: FieldDifference[]
}

const cases: Case[] = [
  {
    desc: 'simple value change',
    prev: { property: 1 },
    curr: { property: 2 },
    expected: [
      {
        key: ['property'],
        previous: '1',
        current: '2',
        modificationType: 'OBJECT_EDITED_PROPERTY',
      },
    ],
  },
  {
    desc: 'top-level object value change',
    prev: { property: { a: 1 } },
    curr: { property: { a: 2 } },
    expected: [
      {
        key: ['property', 'a'],
        previous: '1',
        current: '2',
        modificationType: 'OBJECT_EDITED_PROPERTY',
      },
    ],
  },
  {
    desc: 'top-level array value change',
    prev: { property: [1, 2, 3] },
    curr: { property: [1, 2, 4] },
    expected: [
      {
        key: ['property', '2'],
        previous: '3',
        current: '4',
        modificationType: 'OBJECT_EDITED_PROPERTY',
      },
    ],
  },
  {
    desc: 'simple property added',
    prev: { oldProperty: 1 },
    curr: { oldProperty: 1, newProperty: 2 },
    expected: [
      {
        key: ['newProperty'],
        previous: null,
        current: '2',
        modificationType: 'OBJECT_NEW_PROPERTY',
      },
    ],
  },
  {
    desc: 'object property added',
    prev: { property: { a: 1 } },
    curr: { property: { a: 1, b: 2 } },
    expected: [
      {
        key: ['property', 'b'],
        previous: null,
        current: '2',
        modificationType: 'OBJECT_NEW_PROPERTY',
      },
    ],
  },
  {
    desc: 'nested object property added',
    prev: { property: { a: 1 } },
    curr: { property: { a: 1, b: { c: 2 } } },
    expected: [
      {
        key: ['property', 'b'],
        previous: null,
        current: JSON.stringify({ c: 2 }),
        modificationType: 'OBJECT_NEW_PROPERTY',
      },
    ],
  },
  {
    desc: 'nested array element added',
    prev: { property: [1, 2, 3] },
    curr: { property: [1, 2, 3, 4] },
    expected: [
      {
        key: ['property', '3'],
        previous: null,
        current: '4',
        modificationType: 'ARRAY_NEW_ELEMENT',
      },
    ],
  },
  {
    desc: 'simple property deleted',
    prev: { property: 1 },
    curr: {},
    expected: [
      {
        key: ['property'],
        previous: '1',
        current: null,
        modificationType: 'OBJECT_DELETED_PROPERTY',
      },
    ],
  },
  {
    desc: 'object property deleted',
    prev: { property: { a: 1, b: 2 } },
    curr: { property: { a: 1 } },
    expected: [
      {
        key: ['property', 'b'],
        previous: '2',
        current: null,
        modificationType: 'OBJECT_DELETED_PROPERTY',
      },
    ],
  },
  {
    desc: 'nested object deleted',
    prev: { property: { a: 1, b: 2 } },
    curr: {},
    expected: [
      {
        key: ['property'],
        previous: JSON.stringify({ a: 1, b: 2 }),
        current: null,
        modificationType: 'OBJECT_DELETED_PROPERTY',
      },
    ],
  },
  {
    desc: 'array element deleted',
    prev: { property: [1, 2, 3] },
    curr: { property: [1, 2] },
    expected: [
      {
        key: ['property', '2'],
        previous: '3',
        current: null,
        modificationType: 'ARRAY_DELETED_ELEMENT',
      },
    ],
  },
  {
    desc: 'nested array element deleted',
    prev: { property: { arr: [1, 2, 3] } },
    curr: { property: { arr: [1, 2] } },
    expected: [
      {
        key: ['property', 'arr', '2'],
        previous: '3',
        current: null,
        modificationType: 'ARRAY_DELETED_ELEMENT',
      },
    ],
  },
  {
    desc: 'combo',
    prev: {
      property: { a: 1, b: 2, c: [3, 4, 5] },
      newItem: [7],
      edited: 1,
      propertyToDelete: { d: 6 },
    },
    curr: {
      property: { a: 1, b: 2, c: [3, 4] },
      newItem: [7, 8],
      edited: 2,
      newProperty: { d: 5, e: 6 },
    },
    expected: [
      {
        key: ['property', 'c', '2'],
        previous: '5',
        current: null,
        modificationType: 'ARRAY_DELETED_ELEMENT',
      },
      {
        key: ['newItem', '1'],
        previous: null,
        current: '8',
        modificationType: 'ARRAY_NEW_ELEMENT',
      },
      {
        key: ['edited'],
        previous: '1',
        current: '2',
        modificationType: 'OBJECT_EDITED_PROPERTY',
      },
      {
        key: ['propertyToDelete'],
        previous: JSON.stringify({ d: 6 }),
        current: null,
        modificationType: 'OBJECT_DELETED_PROPERTY',
      },
      {
        key: ['newProperty'],
        previous: null,
        current: JSON.stringify({ d: 5, e: 6 }),
        modificationType: 'OBJECT_NEW_PROPERTY',
      },
    ],
  },
  {
    desc: 'no contract values',
    prev: undefined as any,
    curr: undefined as any,
    expected: [],
  },
]

describe(diffContractValues.name, () => {
  cases.forEach(({ desc, prev, curr, expected }) => {
    it(desc, () => {
      const result = diffContractValues(prev, curr)

      expect(result).toEqual(expected)
    })
  })
})
