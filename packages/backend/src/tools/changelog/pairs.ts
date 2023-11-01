import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'

export { getMatchingContractPairs, splitSafeContractPairs }

type UnsafeContractPair = readonly [
  ContractParameters,
  ContractParameters | undefined,
]

type SafeContractPair = readonly [ContractParameters, ContractParameters]

function getMatchingContractPairs(
  previous: DiscoveryOutput,
  current: DiscoveryOutput,
): UnsafeContractPair[] {
  const pairs = previous.contracts.map(
    (c) =>
      [
        c,
        current.contracts.find(
          (c2) => c.name === c2.name && c.address === c2.address,
        ),
      ] as const,
  )

  return pairs
}

function splitSafeContractPairs(pairs: UnsafeContractPair[]): {
  safe: SafeContractPair[]
  unsafe: UnsafeContractPair[]
} {
  const safe = pairs.filter(([, reference]) =>
    Boolean(reference),
  ) as SafeContractPair[]

  const unsafe = pairs.filter(([, reference]) => !reference)

  return {
    safe,
    unsafe,
  }
}
