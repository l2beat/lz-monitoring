import { ContractParameters } from '@l2beat/discovery-types'
import { ChainId } from '@lz/libs'

import { MilestoneEntry, SmartContractOperation } from './types'

export { getMilestones }

/**
 * @notice Heavily relies on grouping
 * @see groupContracts
 */
function getMilestones(
  /**
   * Contracts to generate milestones for
   */
  contracts: {
    removed: ContractParameters[]
    added: ContractParameters[]
  },
  /**
   * Discovery context
   */
  context: {
    blockNumber: number
    chainId: ChainId
  },
): {
  added: MilestoneEntry[]
  removed: MilestoneEntry[]
} {
  function intoMilestone(
    contract: ContractParameters,
    operation: SmartContractOperation,
  ): MilestoneEntry {
    return {
      targetName: contract.name,
      targetAddress: contract.address,
      chainId: context.chainId,
      blockNumber: context.blockNumber,
      operation,
    }
  }

  const addedMilestones = contracts.added.map((contract) =>
    intoMilestone(contract, 'CONTRACT_ADDED'),
  )
  const removedMilestones = contracts.removed.map((contract) =>
    intoMilestone(contract, 'CONTRACT_REMOVED'),
  )

  return {
    added: addedMilestones,
    removed: removedMilestones,
  }
}
