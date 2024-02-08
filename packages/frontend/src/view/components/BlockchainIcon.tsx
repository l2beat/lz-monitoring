import { ChainId } from '@lz/libs'

import { ArbitrumIcon } from '../icons/blockchains/ArbitrumIcon'
import { AvalancheIcon } from '../icons/blockchains/AvalancheIcon'
import { BaseIcon } from '../icons/blockchains/BaseIcon'
import { BinanceSmartChainIcon } from '../icons/blockchains/BinanceSmartChainIcon'
import { CeloIcon } from '../icons/blockchains/CeloIcon'
import { EthereumIcon } from '../icons/blockchains/EthereumIcon'
import { LineaIcon } from '../icons/blockchains/LineaIcon'
import { OptimismIcon } from '../icons/blockchains/OptimismIcon'
import { PolygonPosIcon } from '../icons/blockchains/PolygonPosIcon'
import { PolygonZkEvmIcon } from '../icons/blockchains/PolygonZkEvmIcon'

export function BlockchainIcon({ chainId }: { chainId: ChainId }) {
  switch (chainId) {
    case ChainId.ARBITRUM:
      return <ArbitrumIcon />
    case ChainId.AVALANCHE:
      return <AvalancheIcon />
    case ChainId.BASE:
      return <BaseIcon />
    case ChainId.BSC:
      return <BinanceSmartChainIcon />
    case ChainId.CELO:
      return <CeloIcon />
    case ChainId.ETHEREUM:
      return <EthereumIcon />
    case ChainId.LINEA:
      return <LineaIcon />
    case ChainId.OPTIMISM:
      return <OptimismIcon />
    case ChainId.POLYGON_ZKEVM:
      return <PolygonZkEvmIcon />
    case ChainId.POLYGON_POS:
      return <PolygonPosIcon />
  }
}
