import { ChainId } from '@lz/libs'

// source: https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids

const CHAIN_IDS = [
  { lzChainId: 101, chainId: ChainId.ETHEREUM },
  { lzChainId: 102, chainId: ChainId.BSC },
  { lzChainId: 106, chainId: ChainId.AVALANCHE },
  { lzChainId: 109, chainId: ChainId.POLYGON_POS },
  { lzChainId: 110, chainId: ChainId.ARBITRUM },
  { lzChainId: 111, chainId: ChainId.OPTIMISM },
  { lzChainId: 125, chainId: ChainId.CELO },
  { lzChainId: 158, chainId: ChainId.POLYGON_ZKEVM },
  { lzChainId: 183, chainId: ChainId.LINEA },
  { lzChainId: 184, chainId: ChainId.BASE },
]

export function getChainIdFromLzId(lzChainId: number): ChainId | undefined {
  return CHAIN_IDS.find((c) => c.lzChainId === lzChainId)?.chainId
}
