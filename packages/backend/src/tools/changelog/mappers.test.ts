import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { getDiscoveryChanges } from './changes'
import { createComparablePairs, flattenChanges } from './mappers'
import { ChangelogEntry, MilestoneEntry } from './types'

describe(createComparablePairs.name, () => {
  it('returns an array of pairs in case of many elements', () => {
    const initial = [1, 2, 3]

    const pairs = createComparablePairs(initial)

    expect(pairs).toEqual([
      [1, 2],
      [2, 3],
    ])
  })

  it('returns single pair in case of two elements ', () => {
    const initial = [1, 2]

    const pairs = createComparablePairs(initial)

    expect(pairs).toEqual([[1, 2]])
  })

  it('throws in case of insufficient amount of elements to pair', () => {
    const initial = [1]

    expect(() => createComparablePairs(initial)).toThrow()
  })
})

describe(flattenChanges.name, () => {
  it('flattens changes into one-dimensional arrays', () => {
    const mockProperty1 = mockProperty(1)
    const mockProperty2 = mockProperty(2)
    const mockProperty3 = mockProperty(3)
    const mockProperty4 = mockProperty(4)
    const mockProperty5 = mockProperty(5)
    const mockProperty6 = mockProperty(6)

    const mockMilestone1 = mockMilestone(1)
    const mockMilestone2 = mockMilestone(2)
    const mockMilestone3 = mockMilestone(3)
    const mockMilestone4 = mockMilestone(4)

    const input: ReturnType<typeof getDiscoveryChanges>[] = [
      {
        properties: {
          added: [mockProperty1],
          modified: [mockProperty2],
          removed: [mockProperty3],
        },
        milestones: {
          added: [mockMilestone1],
          removed: [mockMilestone2],
        },
      },
      {
        properties: {
          added: [mockProperty4],
          modified: [mockProperty5],
          removed: [mockProperty6],
        },
        milestones: {
          added: [mockMilestone3],
          removed: [mockMilestone4],
        },
      },
    ]

    const result = flattenChanges(input)

    expect(result.changelog).toEqual([
      mockProperty1,
      mockProperty2,
      mockProperty3,
      mockProperty4,
      mockProperty5,
      mockProperty6,
    ])

    expect(result.milestones).toEqual([
      mockMilestone1,
      mockMilestone2,
      mockMilestone3,
      mockMilestone4,
    ])
  })
})

function mockProperty(denominator: number): ChangelogEntry {
  return {
    targetName: `mockProperty#${denominator}`,
    targetAddress: EthereumAddress.random(),
    blockNumber: 1,
    chainId: ChainId.ETHEREUM,
    modificationType: 'OBJECT_NEW_PROPERTY',
    parameterName: 'name',
    parameterPath: ['name'],
    previousValue: null,
    currentValue: 'value',
  }
}

function mockMilestone(denominator: number): MilestoneEntry {
  return {
    targetName: `mockMilestone#${denominator}`,
    targetAddress: EthereumAddress.random(),
    blockNumber: 1,
    chainId: ChainId.ETHEREUM,
    operation: 'CONTRACT_ADDED',
  }
}
