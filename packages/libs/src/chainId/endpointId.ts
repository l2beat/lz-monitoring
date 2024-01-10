// source: https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids

import { ChainId } from './ChainId'

const CHAIN_IDS = [
  // Mainnet
  { endpointId: 101, chainId: ChainId.ETHEREUM },
  { endpointId: 102, chainId: ChainId.BSC },
  { endpointId: 106, chainId: ChainId.AVALANCHE },
  { endpointId: 109, chainId: ChainId.POLYGON_POS },
  { endpointId: 110, chainId: ChainId.ARBITRUM },
  { endpointId: 111, chainId: ChainId.OPTIMISM },
  { endpointId: 125, chainId: ChainId.CELO },
  { endpointId: 158, chainId: ChainId.POLYGON_ZKEVM },
  { endpointId: 183, chainId: ChainId.LINEA },
  { endpointId: 184, chainId: ChainId.BASE },

  // Testnet
  { endpointId: 40121, chainId: ChainId.GOERLI },
]

export function getChainIdFromEndpointId(
  endpointId: number,
): ChainId | undefined {
  return CHAIN_IDS.find((c) => c.endpointId === endpointId)?.chainId
}

export function getEndpointIdFromChainId(chainId: ChainId): number | undefined {
  return CHAIN_IDS.find((c) => c.chainId === chainId)?.endpointId
}
