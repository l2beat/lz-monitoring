import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { BlockchainIcon } from './BlockchainIcon'

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

  useEffect(() => {
    setOptimisticSelect(props.chainId)
  }, [props.chainId])

  function onScroll() {
    setSmall(window.scrollY > 0)
  }

  const sortedChains = props.chainsToDisplay
    .map((chainToDisplay, i) => ({
      key: i,
      icon: <BlockchainIcon chainId={chainToDisplay} />,
      label: getPrettyChainName(chainToDisplay),
      isActive: chainToDisplay === optimisticSelect,
      onClick: () => onClick(chainToDisplay),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <section
      className={cx(
        'sticky top-0 z-network-selector bg-gray-800 px-3.5 md:justify-center md:px-6',
        isSmall ? 'py-2 md:pb-3 md:pt-2' : 'py-3.5 md:pb-6 md:pt-4',
      )}
    >
      <div className="mx-auto max-w-fit">
        <span
          className={cx(
            'block overflow-hidden text-xs text-gray-100 transition-all',
            isSmall ? 'max-h-0' : 'max-h-3.5',
          )}
        >
          Select network
        </span>
        <div className="scrollbar-h-1.5 flex items-stretch gap-3 overflow-x-auto py-2 scrollbar scrollbar-track-gray-400 scrollbar-thumb-yellow-100">
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
          : 'bg-gray-600 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        isSmall ? 'md:py-2' : 'md:py-3',
      )}
      onClick={onClick}
    >
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  )
}
