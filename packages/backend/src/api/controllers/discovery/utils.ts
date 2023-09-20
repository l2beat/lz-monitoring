import { assert } from '@l2beat/backend-tools'
import type {
  ContractParameters,
  ContractValue,
  DiscoveryOutput,
} from '@l2beat/discovery-types'
import { EthereumAddress } from '@lz/libs'

export function getContractByName(
  name: string,
  discovery: DiscoveryOutput,
): ContractParameters {
  const contracts = discovery.contracts.filter(
    (contract) => contract.name === name,
  )
  assert(
    !(contracts.length > 1),
    `Found more than one contracts of ${name} name`,
  )
  assert(contracts.length === 1, `Found no contract of ${name} name `)

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return contracts[0]!
}

export function getAddressFromValue(
  contract: ContractParameters,
  key: string,
): EthereumAddress {
  const result = getContractValue(contract, key)
  assert(
    typeof result === 'string',
    `Value of key ${key} is not a string on ${contract.name} contract`,
  )
  return EthereumAddress(result)
}

export function getContractValue<T extends ContractValue>(
  contract: ContractParameters,
  key: string,
): T {
  const result = contract.values?.[key] as T | undefined
  assert(
    isNonNullable(result),
    `Value of key ${key} does not exist in ${contract.name} contract`,
  )

  return result
}

function isNonNullable<T>(
  value: T | undefined | null,
): value is NonNullable<T> {
  return value !== null && value !== undefined
}
