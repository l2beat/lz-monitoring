import { Change, ChangelogApiEntry } from '@lz/libs'
import { useState } from 'react'

import { DotIcon } from '../../icons/DotIcon'
import { SolidMinusIcon } from '../../icons/MinusIcon'
import { SolidPlusIcon } from '../../icons/PlusIcon'
import { Code } from '../Code'

export function ChangelogEntry(props: { change: ChangelogApiEntry }) {
  const isPlural = props.change.changes.length > 1
  const titleStart = isPlural
    ? props.change.changes.length.toString() + ' changes'
    : 'Change'
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex flex-col items-center">
        <div className="mt-0.5 h-4 w-4 rounded bg-yellow-100 p-1">
          <DotIcon className="fill-black" />
        </div>
        <div className="grow border-l border-yellow-100" />
      </div>
      <div className="flex grow flex-col overflow-hidden">
        <span className="text-zinc-500 text-md leading-none">
          {titleStart} in block {/* TODO: should be a link */}
          <span className="bg-blue-800 text-blue-500 inline-block rounded-sm px-1 py-0.5">
            {props.change.blockNumber.toString()}
          </span>{' '}
          at{' '}
          <span className="text-white">
            {props.change.timestamp.toTimeOfDay()}
          </span>{' '}
          UTC
        </span>
        {props.change.changes.map((change, i) => (
          <SingleChange key={i} change={change} />
        ))}
      </div>
    </div>
  )
}

function SingleChange(props: { change: Change }) {
  const path = [...props.change.parameterPath]
  const [isExpanded, setIsExpanded] = useState(false)

  //TODO: maybe we can get the description for this key

  return (
    <div className="border-zinc-700 mt-4 rounded-lg border p-2">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs">
          <span className="text-zinc-500">
            {props.change.modificationType} in
          </span>{' '}
          <span className="text-pink-500 bg-pink-700 rounded-sm px-1 py-0.5">
            {path.join('=>')}
          </span>
        </span>
        <button className="h-4 rounded-sm bg-black transition-all">
          {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
        </button>
      </div>
      {isExpanded && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {props.change.previousValue && (
            <div>
              <div className="text-zinc-500 mb-2 text-xs">Previous value</div>
              <Code>
                <span className="bg-red leading-tight">
                  {prettyJsonString(props.change.previousValue)}
                </span>
              </Code>
            </div>
          )}
          {props.change.currentValue && (
            <div>
              <div className="text-zinc-500 mb-2 text-xs">New value</div>
              <Code>
                <span className="bg-green leading-tight">
                  {prettyJsonString(props.change.currentValue)}
                </span>
              </Code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function prettyJsonString(json: string) {
  return JSON.stringify(JSON.parse(json), null, '\t')
}
