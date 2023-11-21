import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'

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
  setChain: (chainId: ChainId) => void
  chainsToDisplay: [ChainId, ...ChainId[]]
}

export function NetworkDropdownSelector({
  chainId,
  chainsToDisplay,
  setChain,
}: Props) {
  const [optimisticSelect, setOptimisticSelect] = useState<ChainId>(chainId)

  function onClick(chainId: ChainId) {
    setOptimisticSelect(chainId)
    setChain(chainId)
  }

  const pills = chainsToDisplay
    .map((chainToDisplay, i) => ({
      key: i,
      icon: getIconForChain(chainToDisplay),
      label: getPrettyChainName(chainToDisplay),
      isActive: chainToDisplay === optimisticSelect,
      onClick: () => onClick(chainToDisplay),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((props) => <PillSelector {...props} />)

  return (
    <section className="bg-gray-500 px-6 py-8 md:justify-center">
      <div className="mx-auto max-w-fit">
        <span className="text-xs text-gray-15">Select network</span>
        <div className="scrollbar-h-1.5 flex items-stretch gap-3 overflow-x-auto py-2 scrollbar scrollbar-track-gray-50 scrollbar-thumb-[#eef36a]">
          {pills}
        </div>
      </div>
    </section>
  )
}

function PillSelector({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}) {
  const focusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusRef.current && isActive) {
      focusRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center' })
    }
  }, [focusRef, isActive])

  return (
    <div
      ref={focusRef}
      className={cx(
        'flex min-w-fit cursor-pointer items-center justify-center gap-1 rounded  py-1.5 pl-4 pr-6 text-center md:py-3',
        isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-300 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
      )}
      onClick={onClick}
    >
      <div className="flex h-[30px] w-[30px] items-center justify-center">
        {icon}
      </div>
      <span className="text-xs">{label}</span>
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
