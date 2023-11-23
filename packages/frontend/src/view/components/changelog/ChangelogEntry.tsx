import { ChangelogApiEntry } from '@lz/libs'
import cx from 'classnames'
import { useState } from 'react'

export function ChangelogEntry(props: { change: ChangelogApiEntry }) {
  return (
    <Expandable title={props.change.timestamp.toDate().toISOString()}>
      <div className="border-gray-650 border-t p-6">
        {props.change.changes.map((change, i) => (
          <div key={i}>
            <span className="text-xs uppercase text-gray-500">Change in</span>{' '}
            <span>{change.parameterPath.join(', ')}</span>
          </div>
        ))}
      </div>
    </Expandable>
  )
}

interface ExpandableProps {
  children: React.ReactNode
  title: React.ReactNode
  className?: string
}

export function Expandable({ children, title, className }: ExpandableProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cx(
        'border-gray-650 bg-gray-750 border-b first:rounded-t-lg last:rounded-b-lg last:border-0 ',
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 py-8">
        <div className="font-semibold">{title}</div>
        <button
          className="text-yellow cursor-pointer p-3 underline"
          onClick={toggleExpand}
        >
          {isExpanded ? 'Hide' : 'View modifications'}
        </button>
      </div>
      <div>{isExpanded && children}</div>
    </div>
  )
}
