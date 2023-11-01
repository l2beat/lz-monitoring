import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { getMatchingContractPairs, splitSafeContractPairs } from './pairs'

describe(getMatchingContractPairs.name, () => {
  it('returns matching contracts', () => {
    const endpoint = {
      address: EthereumAddress.random(),
      name: 'Endpoint',
    } as ContractParameters

    const ulnV2 = {
      address: EthereumAddress.random(),
      name: 'Ultra Light Node V2',
    } as ContractParameters

    const previousOutput = {
      contracts: [endpoint, ulnV2],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [endpoint, ulnV2],
    } as DiscoveryOutput

    const pairs = getMatchingContractPairs(previousOutput, currentOutput)

    expect(pairs).toEqual([
      [endpoint, endpoint],
      [ulnV2, ulnV2],
    ])
  })

  it('returns empty array in case of no contracts present', () => {
    const previousOutput = {
      contracts: [] as ContractParameters[],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [] as ContractParameters[],
    } as DiscoveryOutput

    const pairs = getMatchingContractPairs(previousOutput, currentOutput)

    expect(pairs).toEqual([])
  })
})

describe(splitSafeContractPairs.name, () => {
  it('splits contracts pairs into safe and unsafe when previous output serves as a reference', () => {
    const endpoint = {
      address: EthereumAddress.random(),
      name: 'Endpoint',
    } as ContractParameters

    const ulnV2 = {
      address: EthereumAddress.random(),
      name: 'Ultra Light Node V2',
    } as ContractParameters

    const unmatchedContract = {
      address: EthereumAddress.random(),
      name: 'Unmatched',
    } as ContractParameters

    const previousOutput = {
      contracts: [endpoint, ulnV2],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [endpoint, ulnV2, unmatchedContract],
    } as DiscoveryOutput

    const pairs = getMatchingContractPairs(previousOutput, currentOutput)

    const split = splitSafeContractPairs(pairs)

    expect(split.safe).toEqual([
      [endpoint, endpoint],
      [ulnV2, ulnV2],
    ])

    expect(split.unsafe).toEqual([])
  })

  it('splits contracts pairs into safe and unsafe when current output serves as a reference', () => {
    const endpoint = {
      address: EthereumAddress.random(),
      name: 'Endpoint',
    } as ContractParameters

    const ulnV2 = {
      address: EthereumAddress.random(),
      name: 'Ultra Light Node V2',
    } as ContractParameters

    const unmatchedContract = {
      address: EthereumAddress.random(),
      name: 'Unmatched',
    } as ContractParameters

    const previousOutput = {
      contracts: [endpoint, ulnV2],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [endpoint, ulnV2, unmatchedContract],
    } as DiscoveryOutput

    const pairs = getMatchingContractPairs(currentOutput, previousOutput)

    const split = splitSafeContractPairs(pairs)

    expect(split.safe).toEqual([
      [endpoint, endpoint],
      [ulnV2, ulnV2],
    ])

    expect(split.unsafe).toEqual([[unmatchedContract, undefined]])
  })
})
