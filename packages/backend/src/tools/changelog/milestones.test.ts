import { ContractParameters } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect } from 'earl'

import { getMilestones } from './milestones'

describe(getMilestones.name, () => {
  it('transforms added and removed contracts into milestones', () => {
    const changeContext = {
      blockNumber: 1000,
      chainId: ChainId.ETHEREUM,
    }

    const removedContractA = mockContract('RemovedContractA')
    const removedContractB = mockContract('RemovedContractB')
    const addedContractA = mockContract('AddedContractA')
    const addedContractB = mockContract('AddedContractB')

    const milestones = getMilestones(
      {
        added: [addedContractA, addedContractB],
        removed: [removedContractA, removedContractB],
      },
      changeContext,
    )

    expect(milestones.added).toEqual([
      {
        targetName: addedContractA.name,
        targetAddress: addedContractA.address,
        chainId: changeContext.chainId,
        blockNumber: changeContext.blockNumber,
        operation: 'CONTRACT_ADDED',
      },
      {
        targetName: addedContractB.name,
        targetAddress: addedContractB.address,
        chainId: changeContext.chainId,
        blockNumber: changeContext.blockNumber,
        operation: 'CONTRACT_ADDED',
      },
    ])

    expect(milestones.removed).toEqual([
      {
        targetName: removedContractA.name,
        targetAddress: removedContractA.address,
        chainId: changeContext.chainId,
        blockNumber: changeContext.blockNumber,
        operation: 'CONTRACT_REMOVED',
      },
      {
        targetName: removedContractB.name,
        targetAddress: removedContractB.address,
        chainId: changeContext.chainId,
        blockNumber: changeContext.blockNumber,
        operation: 'CONTRACT_REMOVED',
      },
    ])
  })
})

function mockContract(name: string): ContractParameters {
  return {
    name,
    address: EthereumAddress.random(),
  } as ContractParameters
}
