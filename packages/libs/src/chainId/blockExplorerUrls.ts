import { EthereumAddress } from '../utils'
import { ChainId, SupportedChainName } from './ChainId'

export function getBlockExplorerUrl(
  address: EthereumAddress,
  chainId: ChainId,
): string {
  return (
    BLOCK_EXPLORER_URLS[ChainId.getName(chainId)] +
    'address/' +
    address.toString()
  )
}

export const BLOCK_EXPLORER_URLS: Record<SupportedChainName, string> = {
  ethereum: 'https://etherscan.io/',
  arbitrum: 'https://arbiscan.io/',
  optimism: 'https://optimistic.etherscan.io/',
  'polygon-pos': 'https://polygonscan.com/',
  'polygon-zkevm': 'https://zkevm.polygonscan.com/',
  bsc: 'https://bscscan.com/',
  avalanche: 'https://snowtrace.dev/',
  celo: 'https://celoscan.io/',
  linea: 'https://linea.build/',
  base: 'https://basescan.org/',
  gnosis: 'https://gnosisscan.io/',
}

export function getBlockExplorerName(chainId: ChainId): string {
  return BLOCK_EXPLORER_NAMES[ChainId.getName(chainId)]
}

const BLOCK_EXPLORER_NAMES: Record<SupportedChainName, string> = {
  ethereum: 'Etherscan',
  arbitrum: 'Arbiscan',
  optimism: 'Optimistic Etherscan',
  'polygon-pos': 'PolygonScan',
  'polygon-zkevm': 'zkEVM PolygonScan',
  bsc: 'BscScan',
  avalanche: 'SnowTrace',
  celo: 'CeloScan',
  linea: 'Linea',
  base: 'BaseScan',
  gnosis: 'GnosisScan',
}
