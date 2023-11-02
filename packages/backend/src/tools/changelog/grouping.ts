import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'

export { getAddedContracts, getRemovedContracts, groupContracts }

type SafeContractPair = [ContractParameters, ContractParameters]

/**
 * Groups output's contracts into 3 buckets based on changes made between given outputs
 */
function groupContracts(
  previous: DiscoveryOutput,
  current: DiscoveryOutput,
): {
  modified: SafeContractPair[]
  removed: ContractParameters[]
  added: ContractParameters[]
} {
  // previous contract <-> current contract
  const modifiedContracts = getModifiedContracts(previous, current)

  // previous contract <-> ?
  const removedContracts = getRemovedContracts(previous, current)

  // ? <-> current contract
  const addedContracts = getAddedContracts(previous, current)

  return {
    modified: modifiedContracts,
    removed: removedContracts,
    added: addedContracts,
  }
}

/**
 * Matching contracts that are present in both previous and current
 */
function getModifiedContracts(
  previous: DiscoveryOutput,
  current: DiscoveryOutput,
): SafeContractPair[] {
  return (
    previous.contracts
      .map((c) => [
        c,
        current.contracts.find(
          (c2) => c.name === c2.name && c.address === c2.address,
        ),
      ])
      // type assertion since filter returns array of not-undefined pairs
      .filter(([, c2]) => c2) as SafeContractPair[]
  )
}

/**
 * Matching contracts that are present in current output and not in previous
 */
function getAddedContracts(
  previous: DiscoveryOutput,
  current: DiscoveryOutput,
): ContractParameters[] {
  return current.contracts.filter(
    (c) =>
      !previous.contracts.find(
        (c2) => c.name === c2.name && c.address === c2.address,
      ),
  )
}

/**
 * Matching contracts that are present in previous output and not in current
 */
function getRemovedContracts(
  previous: DiscoveryOutput,
  current: DiscoveryOutput,
): ContractParameters[] {
  return previous.contracts.filter(
    (c) =>
      !current.contracts.find(
        (c2) => c.name === c2.name && c.address === c2.address,
      ),
  )
}
