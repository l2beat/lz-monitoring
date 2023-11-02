import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { groupContracts } from './grouping'

describe(groupContracts.name, () => {
  it('returns grouped contracts with only modified ones', () => {
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

    const groupedContracts = groupContracts(previousOutput, currentOutput)

    expect(groupedContracts.modified).toEqual([
      [endpoint, endpoint],
      [ulnV2, ulnV2],
    ])
    expect(groupedContracts.added).toEqual([])
    expect(groupedContracts.removed).toEqual([])
  })

  it('returns empty arrays in case of no contracts present', () => {
    const previousOutput = {
      contracts: [] as ContractParameters[],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [] as ContractParameters[],
    } as DiscoveryOutput

    const groupedContracts = groupContracts(previousOutput, currentOutput)

    expect(groupedContracts.modified).toEqual([])
    expect(groupedContracts.added).toEqual([])
    expect(groupedContracts.removed).toEqual([])
  })

  it('returns modified, altered and removed contracts as groups', () => {
    const endpoint = {
      address: EthereumAddress.random(),
      name: 'Endpoint',
    } as ContractParameters

    const ulnV2 = {
      address: EthereumAddress.random(),
      name: 'Ultra Light Node V2',
    } as ContractParameters

    const addedContract = {
      address: EthereumAddress.random(),
      name: 'Added',
    } as ContractParameters

    const removedContract = {
      address: EthereumAddress.random(),
      name: 'Removed',
    } as ContractParameters

    const previousOutput = {
      contracts: [endpoint, ulnV2, removedContract],
    } as DiscoveryOutput

    const currentOutput = {
      contracts: [endpoint, ulnV2, addedContract],
    } as DiscoveryOutput

    const groupedContracts = groupContracts(previousOutput, currentOutput)

    expect(groupedContracts.modified).toEqual([
      [endpoint, endpoint],
      [ulnV2, ulnV2],
    ])

    expect(groupedContracts.removed).toEqual([removedContract])
    expect(groupedContracts.added).toEqual([addedContract])
  })
})
