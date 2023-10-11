import cx from 'classnames'
import { useState } from 'react'

import { DropdownArrowIcon } from '../../icons/DropdownArrowIcon'

export { ExpandableRow }

function ExpandableRow({
  children,
  title,
  className,
}: {
  children: React.ReactNode
  title: string
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className={cx('bg-gray-800', className)}>
      <div className="flex items-center justify-between">
        <div className="px-5 py-3 font-semibold">{title}</div>
        <span
          className="flex cursor-pointer items-center bg-white p-3"
          onClick={toggleExpand}
        >
          <DropdownArrowIcon
            className={cx(
              isExpanded && 'rotate-180',
              'transition-all',
              'duration-500',
            )}
          />
        </span>
      </div>
      <div>{isExpanded && children}</div>
    </div>
  )
}
