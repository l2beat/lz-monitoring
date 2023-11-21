import cx from 'classnames'
import { useState } from 'react'

import { ExpandButton } from './ExpandButton'

interface Props {
  children: React.ReactNode
  hideText: string
  showText: string
}

export function ExpandableContainer(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const expandText = isExpanded ? props.hideText : props.showText

  return (
    <div className="w-full">
      <div
        className={cx(
          'transition-max-height overflow-hidden duration-500 ease-linear',
          // Just a bit of a hack to get the animation to work
          // Setting max-height to some value that given component won't ever reach
          // will force the animation to run
          isExpanded ? 'max-h-[2000px]' : 'max-h-0',
        )}
      >
        {props.children}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cx(
          'flex w-full flex-row items-center justify-center gap-2 rounded-lg border border-yellow-100 p-3 text-xs text-yellow-100 transition-colors duration-300 hover:bg-yellow-100/10',
          isExpanded && 'mt-4',
        )}
      >
        <span>{expandText}</span>
        <ExpandButton
          small
          onClick={() => setIsExpanded(!isExpanded)}
          isExpanded={isExpanded}
        />
      </button>
    </div>
  )
}
