import cx from 'classnames'
import { useEffect, useRef } from 'react'

export function PillSelector({
  icon,
  label,
  isActive,
  isSmall,
  onClick,
}: {
  icon?: React.ReactNode
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
        'flex min-w-fit cursor-pointer items-center justify-center gap-1 rounded py-1.5 text-center transition-all',
        isActive
          ? 'bg-yellow-100 text-black'
          : 'bg-gray-600 text-white brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        isSmall ? 'md:py-2' : 'md:py-3',
        icon ? 'pl-4 pr-6' : 'p-4',
      )}
      onClick={onClick}
    >
      {icon && (
        <div className="flex h-6 w-6 items-center justify-center">{icon}</div>
      )}
      <span className="text-xs">{label}</span>
    </div>
  )
}
