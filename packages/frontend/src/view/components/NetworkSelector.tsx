import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { BlockchainIcon } from './BlockchainIcon'

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
      icon: <BlockchainIcon chainId={chainToDisplay} />,
      label: getPrettyChainName(chainToDisplay),
      isActive: chainToDisplay === optimisticSelect,
      onClick: () => onClick(chainToDisplay),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((props) => <PillSelector {...props} />)

  return (
    <section className="sticky top-0 z-network-selector bg-gray-500 p-3.5 md:justify-center md:p-6 md:pt-4">
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
        'flex min-w-fit cursor-pointer items-center justify-center gap-1 rounded  py-1.5 pl-4 pr-6 text-center md:py-3',
        isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-300 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
      )}
      onClick={onClick}
    >
      <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  )
}
