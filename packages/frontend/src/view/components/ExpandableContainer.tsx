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
          isExpanded ? 'h-100 overflow-visible' : 'h-0 overflow-hidden',
        )}
      >
        {props.children}
      </div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cx(
          'flex w-full cursor-pointer flex-row items-center justify-center gap-2 rounded-lg border border-yellow-100 p-3 text-xs text-yellow-100 transition-colors duration-300 hover:bg-yellow-100/10',
          isExpanded && 'mt-4',
        )}
      >
        <span>{expandText}</span>
        <ExpandButton
          small
          onClick={() => setIsExpanded(!isExpanded)}
          isExpanded={isExpanded}
        />
      </div>
    </div>
  )
}
