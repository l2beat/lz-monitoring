import { ChainId } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useState } from 'react'

import { config } from '../../../config'
import { ProtocolVersion } from '../../../constants/protocol-version'
import { NetworkSelector } from './NetworkSelector'
import { VersionSelector } from './VersionSelector'

interface Props {
  chainId: ChainId
  setChain: (chainId: ChainId) => void
  chainsToDisplay: [ChainId, ...ChainId[]]
  version: ProtocolVersion
  setVersion: (version: ProtocolVersion) => void
}

export function Selectors(props: Props) {
  const [isSmall, setSmall] = useState(false)

  function onScroll() {
    setSmall(window.scrollY > 0)
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll)

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section
      className={cx(
        'sticky top-0 z-network-selector bg-gray-800 px-3.5 md:justify-center',
        isSmall ? 'py-2 md:pb-1 md:pt-1' : 'py-3.5 md:pb-6 md:pt-4',
      )}
    >
      <div className="mx-auto max-w-fit">
        {config.features.v2visible && (
          <VersionSelector {...props} isSmall={isSmall} />
        )}
        <NetworkSelector {...props} isSmall={isSmall} />
      </div>
    </section>
  )
}
