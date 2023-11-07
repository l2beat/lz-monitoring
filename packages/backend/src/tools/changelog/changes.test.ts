import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { getDiscoveryChanges } from './changes'

describe(getDiscoveryChanges.name, () => {
  it('handles contract modification', () => {
    const endpoint = {
      name: 'Endpoint',
      address: EthereumAddress.random(),
    } as ContractParameters

    const ulnV2 = {
      name: 'Ultra Light Node V2',
      address: EthereumAddress.random(),
    } as ContractParameters

    const previousEndpoint = {
      ...endpoint,
      values: {
        BLOCK_VERSION: 1,
        defaultSendVersion: 2,
      },
    }

    const currentEndpoint = {
      ...endpoint,
      values: {
        BLOCK_VERSION: 2,
        defaultSendVersion: 3,
        isReceivingPayload: false,
      },
    }

    const previousUlnV2 = {
      ...ulnV2,
      values: {
        CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS: 20,
        defaultAdapterParams: {
          '101': [
            {
              proofType: 1,
              adapterParams:
                '0x00010000000000000000000000000000000000000000000000000000000000030d40',
            },
          ],
        },
      },
    }

    const currentUlnV2 = {
      ...ulnV2,
      values: {
        CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS: 15,
        defaultAdapterParams: {
          '101': [
            {
              proofType: 1,
              adapterParams:
                '0x00010000000000000000000000000000000000000000000000000000000000030d40',
            },
            {
              proofType: 2,
              adapterParams:
                '0x00010000000000000000000000000000000000000000000000000000000000030d48',
            },
          ],
        },
      },
    }

    const previousOutput = {
      chain: 'ethereum',
      blockNumber: 1000,
      contracts: [previousEndpoint, previousUlnV2],
    } as unknown as DiscoveryOutput

    const currentOutput = {
      chain: 'ethereum',
      blockNumber: 2000,
      contracts: [currentEndpoint, currentUlnV2],
    } as unknown as DiscoveryOutput

    const changelogEntries = getDiscoveryChanges(previousOutput, currentOutput)

    expect(changelogEntries.properties.added).toEqual([])
    expect(changelogEntries.properties.removed).toEqual([])
    expect(changelogEntries.properties.modified).toEqual([
      {
        targetName: endpoint.name,
        targetAddress: endpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_EDITED_PROPERTY',
        parameterName: 'BLOCK_VERSION',
        parameterPath: ['BLOCK_VERSION'],
        previousValue: '1',
        currentValue: '2',
      },
      {
        targetName: endpoint.name,
        targetAddress: endpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_EDITED_PROPERTY',
        parameterName: 'defaultSendVersion',
        parameterPath: ['defaultSendVersion'],
        previousValue: '2',
        currentValue: '3',
      },
      {
        targetName: endpoint.name,
        targetAddress: endpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'isReceivingPayload',
        parameterPath: ['isReceivingPayload'],
        previousValue: null,
        currentValue: 'false',
      },
      {
        targetName: ulnV2.name,
        targetAddress: ulnV2.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_EDITED_PROPERTY',
        parameterName: 'CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS',
        parameterPath: ['CONFIG_TYPE_INBOUND_BLOCK_CONFIRMATIONS'],
        previousValue: '20',
        currentValue: '15',
      },
      {
        targetName: ulnV2.name,
        targetAddress: ulnV2.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'ARRAY_NEW_ELEMENT',
        parameterName: 'defaultAdapterParams',
        parameterPath: ['defaultAdapterParams', '101', '1'],
        previousValue: null,
        currentValue:
          '{"proofType":2,"adapterParams":"0x00010000000000000000000000000000000000000000000000000000000000030d48"}',
      },
    ])

    expect(changelogEntries.milestones.added).toEqual([])
    expect(changelogEntries.milestones.removed).toEqual([])
  })

  it('handles contract creation', () => {
    const currentEndpoint = {
      name: 'Endpoint',
      address: EthereumAddress.random(),
      values: {
        BLOCK_VERSION: 2,
        defaultSendVersion: 3,
        isReceivingPayload: false,
      },
    }

    const previousOutput = {
      chain: 'ethereum',
      blockNumber: 1000,
      contracts: [],
    } as unknown as DiscoveryOutput

    const currentOutput = {
      chain: 'ethereum',
      blockNumber: 2000,
      contracts: [currentEndpoint],
    } as unknown as DiscoveryOutput

    const changelogEntries = getDiscoveryChanges(previousOutput, currentOutput)

    expect(changelogEntries.properties.modified).toEqual([])
    expect(changelogEntries.properties.removed).toEqual([])
    expect(changelogEntries.properties.added).toEqual([
      {
        targetName: currentEndpoint.name,
        targetAddress: currentEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'BLOCK_VERSION',
        parameterPath: ['BLOCK_VERSION'],
        previousValue: null,
        currentValue: '2',
      },
      {
        targetName: currentEndpoint.name,
        targetAddress: currentEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'defaultSendVersion',
        parameterPath: ['defaultSendVersion'],
        previousValue: null,
        currentValue: '3',
      },
      {
        targetName: currentEndpoint.name,
        targetAddress: currentEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'isReceivingPayload',
        parameterPath: ['isReceivingPayload'],
        previousValue: null,
        currentValue: 'false',
      },
    ])

    expect(changelogEntries.milestones.removed).toEqual([])
    expect(changelogEntries.milestones.added).toEqual([
      {
        targetName: currentEndpoint.name,
        targetAddress: currentEndpoint.address,
        blockNumber: currentOutput.blockNumber,
        operation: 'CONTRACT_ADDED',
        chainId: ChainId.ETHEREUM,
      },
    ])
  })

  it('handles contract removal', () => {
    const previousEndpoint = {
      name: 'Endpoint',
      address: EthereumAddress.random(),
      values: {
        BLOCK_VERSION: 2,
        defaultSendVersion: 3,
        isReceivingPayload: false,
      },
    }

    const previousOutput = {
      chain: 'ethereum',
      blockNumber: 1000,
      contracts: [previousEndpoint],
    } as unknown as DiscoveryOutput

    const currentOutput = {
      chain: 'ethereum',
      blockNumber: 2000,
      contracts: [],
    } as unknown as DiscoveryOutput

    const changelogEntries = getDiscoveryChanges(previousOutput, currentOutput)

    expect(changelogEntries.properties.added).toEqual([])
    expect(changelogEntries.properties.modified).toEqual([])
    expect(changelogEntries.properties.removed).toEqual([
      {
        targetName: previousEndpoint.name,
        targetAddress: previousEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_DELETED_PROPERTY',
        parameterName: 'BLOCK_VERSION',
        parameterPath: ['BLOCK_VERSION'],
        previousValue: '2',
        currentValue: null,
      },
      {
        targetName: previousEndpoint.name,
        targetAddress: previousEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_DELETED_PROPERTY',
        parameterName: 'defaultSendVersion',
        parameterPath: ['defaultSendVersion'],
        previousValue: '3',
        currentValue: null,
      },
      {
        targetName: previousEndpoint.name,
        targetAddress: previousEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_DELETED_PROPERTY',
        parameterName: 'isReceivingPayload',
        parameterPath: ['isReceivingPayload'],
        previousValue: 'false',
        currentValue: null,
      },
    ])

    expect(changelogEntries.milestones.added).toEqual([])
    expect(changelogEntries.milestones.removed).toEqual([
      {
        targetName: previousEndpoint.name,
        targetAddress: previousEndpoint.address,
        blockNumber: currentOutput.blockNumber,
        operation: 'CONTRACT_REMOVED',
        chainId: ChainId.ETHEREUM,
      },
    ])
  })

  // Just a double check
  it('handles all ops at once', () => {
    const endpoint = {
      name: 'Endpoint',
      address: EthereumAddress.random(),
    }

    const previousEndpoint = {
      ...endpoint,
      values: {
        toBeChanged: 1,
      },
    }

    const currentEndpoint = {
      ...endpoint,
      values: {
        toBeChanged: 2,
      },
    }

    const contractToBeRemoved = {
      name: 'Removed',
      address: EthereumAddress.random(),
      values: {
        toBeRemovedA: 1,
        toBeRemovedB: 2,
      },
    }

    const contractToBeAdded = {
      name: 'Added',
      address: EthereumAddress.random(),
      values: {
        toBeAddedA: 1,
        toBeAddedB: 2,
      },
    }

    const previousOutput = {
      chain: 'ethereum',
      blockNumber: 1000,
      contracts: [previousEndpoint, contractToBeRemoved],
    } as unknown as DiscoveryOutput

    const currentOutput = {
      chain: 'ethereum',
      blockNumber: 2000,
      contracts: [currentEndpoint, contractToBeAdded],
    } as unknown as DiscoveryOutput

    const changelogEntries = getDiscoveryChanges(previousOutput, currentOutput)

    expect(changelogEntries.properties.modified).toEqual([
      {
        targetName: currentEndpoint.name,
        targetAddress: currentEndpoint.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_EDITED_PROPERTY',
        parameterName: 'toBeChanged',
        parameterPath: ['toBeChanged'],
        previousValue: '1',
        currentValue: '2',
      },
    ])

    expect(changelogEntries.properties.removed).toEqual([
      {
        targetName: contractToBeRemoved.name,
        targetAddress: contractToBeRemoved.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_DELETED_PROPERTY',
        parameterName: 'toBeRemovedA',
        parameterPath: ['toBeRemovedA'],
        previousValue: '1',
        currentValue: null,
      },
      {
        targetName: contractToBeRemoved.name,
        targetAddress: contractToBeRemoved.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_DELETED_PROPERTY',
        parameterName: 'toBeRemovedB',
        parameterPath: ['toBeRemovedB'],
        previousValue: '2',
        currentValue: null,
      },
    ])

    expect(changelogEntries.properties.added).toEqual([
      {
        targetName: contractToBeAdded.name,
        targetAddress: contractToBeAdded.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'toBeAddedA',
        parameterPath: ['toBeAddedA'],
        previousValue: null,
        currentValue: '1',
      },
      {
        targetName: contractToBeAdded.name,
        targetAddress: contractToBeAdded.address,
        chainId: ChainId.ETHEREUM,
        blockNumber: currentOutput.blockNumber,
        modificationType: 'OBJECT_NEW_PROPERTY',
        parameterName: 'toBeAddedB',
        parameterPath: ['toBeAddedB'],
        previousValue: null,
        currentValue: '2',
      },
    ])

    expect(changelogEntries.milestones.added).toEqual([
      {
        targetName: contractToBeAdded.name,
        targetAddress: contractToBeAdded.address,
        blockNumber: currentOutput.blockNumber,
        operation: 'CONTRACT_ADDED',
        chainId: ChainId.ETHEREUM,
      },
    ])

    expect(changelogEntries.milestones.removed).toEqual([
      {
        targetName: contractToBeRemoved.name,
        targetAddress: contractToBeRemoved.address,
        blockNumber: currentOutput.blockNumber,
        operation: 'CONTRACT_REMOVED',
        chainId: ChainId.ETHEREUM,
      },
    ])
  })
})
