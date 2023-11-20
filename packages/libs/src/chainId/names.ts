import { ChainId } from './ChainId'

export function getPrettyChainName(chain: ChainId): string {
  switch (chain) {
    case ChainId.ARBITRUM:
      return 'Arbitrum'
    case ChainId.AVALANCHE:
      return 'Avalanche C-Chain'
    case ChainId.BASE:
      return 'Base'
    case ChainId.BSC:
      return 'Binance Smart Chain'
    case ChainId.CELO:
      return 'Celo'
    case ChainId.ETHEREUM:
      return 'Ethereum'
    case ChainId.LINEA:
      return 'Linea'
    case ChainId.OPTIMISM:
      return 'Optimism'
    case ChainId.POLYGON_ZKEVM:
      return 'Polygon zkEVM'
    case ChainId.POLYGON_POS:
      return 'Polygon PoS'

    default:
      assertUnreachable()
  }
}

function assertUnreachable(): never {
  throw new Error('Reached an unreachable state.')
}
