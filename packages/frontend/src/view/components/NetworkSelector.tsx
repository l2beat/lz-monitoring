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

export function NetworkSelector(props: Props) {
  const [optimisticSelect, setOptimisticSelect] = useState<ChainId>(
    props.chainId,
  )
  const [isSmall, setSmall] = useState(false)

  function onClick(chainId: ChainId) {
    setOptimisticSelect(chainId)
    props.setChain(chainId)
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function onScroll() {
    setSmall(window.scrollY > 0)
  }

  const sortedChains = props.chainsToDisplay
    .map((chainToDisplay, i) => ({
      key: i,
      icon: getIconForChain(chainToDisplay),
      label: getPrettyChainName(chainToDisplay),
      isActive: chainToDisplay === optimisticSelect,
      onClick: () => onClick(chainToDisplay),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <section
      className={cx(
        'sticky top-0 z-network-selector bg-gray-500 px-3.5 md:justify-center md:px-6',
        isSmall ? 'py-2 md:pb-3 md:pt-2' : 'py-3.5 md:pb-6 md:pt-4',
      )}
    >
      <div className="mx-auto max-w-fit">
        <span
          className={cx(
            'block  overflow-hidden text-xs text-gray-15 transition-all',
            isSmall ? 'max-h-0' : 'max-h-3.5',
          )}
        >
          Select network
        </span>
        <div className="scrollbar-h-1.5 flex items-stretch gap-3 overflow-x-auto py-2 scrollbar scrollbar-track-gray-50 scrollbar-thumb-[#eef36a]">
          {sortedChains.map((chain) => (
            <PillSelector
              key={chain.key}
              icon={chain.icon}
              label={chain.label}
              isActive={chain.isActive}
              isSmall={isSmall}
              onClick={chain.onClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function PillSelector({
  icon,
  label,
  isActive,
  isSmall,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isSmall: boolean
  onClick: () => void
}) {
  const focusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusRef.current && isActive) {
      focusRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      })
    }
  }, [focusRef, isActive])

  return (
    <div
      ref={focusRef}
      className={cx(
        'flex min-w-fit cursor-pointer items-center justify-center gap-1 rounded  py-1.5 pl-4 pr-6 text-center transition-all ',
        isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-300 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        isSmall ? 'md:py-2' : 'md:py-3',
      )}
      onClick={onClick}
    >
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
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
