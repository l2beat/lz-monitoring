export { endpoints }
export type { SupportedSafeChainIds }

type SupportedSafeChainIds = keyof typeof endpoints.list

const safeServiceEndpoints = {
  1: 'https://safe-transaction-mainnet.safe.global', // Ethereum mainnet
  42161: 'https://safe-transaction-arbitrum.safe.global', // Arbitrum
  10: 'https://safe-transaction-optimism.safe.global/', // Optimism
  56: 'https://safe-transaction-bsc.safe.global/', // BSC mainnet
  43114: 'https://safe-transaction-avalanche.safe.global/', // Avalanche
  42220: 'https://safe-transaction-celo.safe.global/', // Celo
  // 59144 Linea is not supported
  8453: 'https://safe-transaction-base.safe.global/', // Base
  //   1101 Polygon ZK-EVM is not supported
  100: 'https://safe-transaction-gnosis-chain.safe.global/', // Gnosis
} as const

function isChainSupported(chainId: number): chainId is SupportedSafeChainIds {
  return Object.keys(safeServiceEndpoints).includes(chainId.toString())
}

const endpoints = {
  isChainSupported,
  list: safeServiceEndpoints,
}
