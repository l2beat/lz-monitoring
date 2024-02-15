import cx from 'classnames'
import { useEffect, useRef, useState } from 'react'

import {
  PROTOCOL_VERSION,
  ProtocolVersion,
} from '../../constants/protocol-version'

interface Props {
  version: ProtocolVersion
  setVersion: (version: ProtocolVersion) => void
}

export function VersionSelector(props: Props) {
  const versions = Object.values(PROTOCOL_VERSION)

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
        'z-network-selector bg-gray-900 px-3.5 md:px-6',
        'py-2 md:pb-3 md:pt-2',
      )}
    >
      <div className="max-w-fit md:mx-auto">
        <span
          className={cx(
            'block overflow-hidden text-xs text-gray-100 transition-all',
            isSmall ? 'max-h-0' : 'max-h-3.5',
          )}
        >
          Select version
        </span>
        <div className="flex gap-3 py-2">
          {versions.map((version) => {
            return (
              <PillSelector
                key={version}
                label={version}
                isSmall={isSmall}
                isActive={version === props.version}
                onClick={() => props.setVersion(version)}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function PillSelector({
  label,
  isActive,
  isSmall,
  onClick,
}: {
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
        'flex cursor-pointer items-center justify-center gap-2 rounded px-5 text-center transition-all',
        isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-600 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        isSmall ? 'md:py-3' : 'md:py-3',
      )}
      onClick={onClick}
    >
      <span className="text-sm">{label}</span>
    </div>
  )
}
