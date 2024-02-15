import { ChainId, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useState } from 'react'

import { BlockchainIcon } from '../BlockchainIcon'
import { PillSelector } from './Pill'

interface Props {
  chainId: ChainId
  setChain: (chainId: ChainId) => void
  chainsToDisplay: [ChainId, ...ChainId[]]

  isSmall: boolean
}

export function NetworkSelector(props: Props) {
  const [optimisticSelect, setOptimisticSelect] = useState<ChainId>(
    props.chainId,
  )

  function onClick(chainId: ChainId) {
    setOptimisticSelect(chainId)
    props.setChain(chainId)
  }

  useEffect(() => {
    setOptimisticSelect(props.chainId)
  }, [props.chainId])

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
    <>
      <span
        className={cx(
          'block overflow-hidden text-xs text-gray-100 transition-all',
          props.isSmall ? 'max-h-0' : 'max-h-3.5',
        )}
      >
        Select network
      </span>
      <div className="scrollbar-h-1.5 mt-0.5 flex items-stretch gap-3 overflow-x-auto py-1 scrollbar scrollbar-track-gray-400 scrollbar-thumb-yellow-100">
        {sortedChains.map((chain) => (
          <PillSelector
            key={chain.key}
            icon={chain.icon}
            label={chain.label}
            isActive={chain.isActive}
            isSmall={props.isSmall}
            onClick={chain.onClick}
          />
        ))}
      </div>
    </>
  )
}
