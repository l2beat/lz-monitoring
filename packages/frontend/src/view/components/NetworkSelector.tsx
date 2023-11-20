import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useState } from 'react'

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

interface Props {
  chainId: ChainId
  setChainId: (chainId: ChainId) => void
  chainsToDisplay: [ChainId, ...ChainId[]]
}

export function NetworkDropdownSelector(props: Props) {
  // We want almost instance user feedback, but api call
  // and refresh itself will take a bit thus affecting ux
  const [optimisticSelect, setOptimisticSelect] = useState<ChainId>(
    props.chainId,
  )

  function setChainId(chainId: ChainId) {
    setOptimisticSelect(chainId)
    props.setChainId(chainId)
  }

  if (!props.chainsToDisplay.includes(props.chainId)) {
    setChainId(props.chainsToDisplay[0])
  }

  const pills = props.chainsToDisplay
    .map((chainToDisplay, i) => ({
      key: i,
      icon: getIconForChain(chainToDisplay),
      label: getPrettyChainName(chainToDisplay),
      isActive: chainToDisplay === optimisticSelect,
      onClick: () => setChainId(chainToDisplay),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((props) => <PillSelector {...props} />)

  return (
    <section className="bg-gray-500 px-6 py-8 md:flex md:justify-center">
      <div className="md:max-w-[1650px]">
        <span className="text-xs text-gray-15">Select network</span>
        <div className="scrollbar-h-1.5 flex items-stretch gap-3 overflow-x-auto py-2 scrollbar scrollbar-track-gray-50 scrollbar-thumb-[#eef36a]">
          {pills}
        </div>
      </div>
    </section>
  )
}

function PillSelector(props: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <div
      className={cx(
        'flex min-w-fit cursor-pointer items-center justify-center gap-1 rounded px-5 py-3 text-center',
        props.isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-300 text-white brightness-100 filter transition-all duration-300 hover:brightness-[130%]',
      )}
      onClick={props.onClick}
    >
      <div className="flex h-[25px] w-[25px] items-center justify-center">
        {props.icon}
      </div>
      <span>{props.label}</span>
    </div>
  )
}

function getIconForChain(chain: ChainId): React.ReactNode {
  switch (chain) {
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
