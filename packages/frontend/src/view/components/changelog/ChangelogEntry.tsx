import { Change, ChangelogApiEntry, Hash256, ModificationType } from '@lz/libs'
import { useState } from 'react'

import { DotIcon } from '../../icons/DotIcon'
import { SolidMinusIcon } from '../../icons/MinusIcon'
import { SolidPlusIcon } from '../../icons/PlusIcon'
import { BlockNumber } from '../BlockNumber'
import { Code } from '../Code'
import { TransactionHash } from '../TransactionHash'

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
        <span className="text-md leading-none text-zinc-500">
          {titleStart} in tx{' '}
          <PossibleTransactions txs={props.change.possibleTxHashes} /> in block
          <BlockNumber blockNumber={props.change.blockNumber} /> at{' '}
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

function PossibleTransactions(props: { txs: Hash256[] }) {
  if (props.txs.length === 0) {
    return <>unknown</>
  }

  if (props.txs.length > 1) {
    return props.txs
      .map<React.ReactNode>((tx, i) => (
        <TransactionHash key={i} transactionHash={tx.toString()} />
      ))
      .reduce<React.ReactNode[]>(
        (acc, elem) => (acc.length === 0 ? [elem] : [...acc, ' or ', elem]),
        [],
      )
  }
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <TransactionHash transactionHash={props.txs[0]!.toString()} />
    </>
  )
}

function SingleChange(props: { change: Change }) {
  const path = [...props.change.parameterPath]
  const [isExpanded, setIsExpanded] = useState(false)

  //TODO: maybe we can get the description for this key

  return (
    <div className="mt-4 rounded-lg border border-zinc-700 p-2">
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs">
          <span className="text-zinc-500">
            {getModificationTypeText(props.change.modificationType)}
          </span>{' '}
          <span className="rounded-sm bg-pink-700 px-1 py-0.5 text-pink-500">
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
              <div className="mb-2 text-xs text-zinc-500">Previous value</div>
              <Code>
                <span className="bg-red leading-tight">
                  {prettyJsonString(props.change.previousValue)}
                </span>
              </Code>
            </div>
          )}
          {props.change.currentValue && (
            <div>
              <div className="mb-2 text-xs text-zinc-500">Current value</div>
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

function getModificationTypeText(type: ModificationType) {
  switch (type) {
    case 'ARRAY_DELETED_ELEMENT':
    case 'OBJECT_DELETED_PROPERTY':
      return 'Removed value from'
    case 'ARRAY_EDITED_ELEMENT':
    case 'OBJECT_EDITED_PROPERTY':
      return 'Edited value in'
    case 'ARRAY_NEW_ELEMENT':
    case 'OBJECT_NEW_PROPERTY':
      return 'New value in'
    default:
      assertUnreachable(type)
  }
}

function prettyJsonString(json: string) {
  return JSON.stringify(JSON.parse(json), null, '\t')
}

function assertUnreachable(_: never): never {
  throw new Error('There are more values to handle.')
}
