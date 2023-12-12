import {
  Change,
  ChangelogApiEntry,
  getChainIdFromEndpointId,
  getPrettyChainName,
  Hash256,
  ModificationType,
} from '@lz/libs'
import { useState } from 'react'

import { ChangeIcon } from '../../icons/ChangeIcon'
import { CloseIcon } from '../../icons/CloseIcon'
import { MinusIcon, SolidMinusIcon } from '../../icons/MinusIcon'
import { PlusIcon, SolidPlusIcon } from '../../icons/PlusIcon'
import { BlockNumber } from '../BlockNumber'
import { Code } from '../Code'
import { TransactionHash } from '../TransactionHash'

export function ChangesDetails(props: {
  changes: ChangelogApiEntry[] | null
  setChangesDetails: (changes: ChangelogApiEntry[] | null) => void
  groupedEntries?: boolean
  className?: string
}) {
  if (!props.changes) {
    return null
  }

  return (
    <div className={props.className}>
      <div className="my-6 flex items-center justify-between">
        <span className="font-medium">
          {props.changes[0]?.timestamp.toMMDDYYYY()}
        </span>
        <button onClick={() => props.setChangesDetails(null)}>
          <CloseIcon />
        </button>
      </div>

      {props.changes.map((change, i) => (
        <ChangelogEntry
          key={i}
          change={change}
          grouped={props.groupedEntries}
        />
      ))}
    </div>
  )
}

function ChangelogEntry(props: {
  change: ChangelogApiEntry
  grouped?: boolean
}) {
  const isPlural = props.change.changes.length > 1
  const titleStart = isPlural
    ? props.change.changes.length.toString() + ' changes'
    : 'Change'

  return (
    <div className="mb-6 flex gap-4">
      <div className="hidden flex-col items-center md:flex">
        <ChangeIcon className="mt-0.5" />
        <div className="grow border-l border-yellow-100" />
      </div>
      <div className="flex grow flex-col gap-3 overflow-hidden">
        <span className="text-md leading-normal text-zinc-500">
          <ChangeIcon className="relative -top-px mr-2 inline-block md:hidden" />
          {titleStart} in tx{' '}
          <PossibleTransactions txs={props.change.possibleTxHashes} /> in block
          <BlockNumber blockNumber={props.change.blockNumber} /> at{' '}
          <span className="text-white">
            {props.change.timestamp.toTimeOfDay()}
          </span>{' '}
          UTC
        </span>
        {!props.grouped ? (
          <div>
            {props.change.changes.map((change, i) => (
              <SingleChange key={i} change={change} />
            ))}
          </div>
        ) : (
          <Grouped changes={props.change.changes} />
        )}
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

function Grouped(props: { changes: Change[] }) {
  const groupedChanges = props.changes.reduce<
    Partial<Record<Change['group'], Change[]>>
  >((acc, change) => {
    const group = acc[change.group]
    if (group) {
      group.push(change)
    } else {
      acc[change.group] = [change]
    }
    return acc
  }, {})

  return (
    <>
      {Object.entries(groupedChanges).map(
        ([group, changes], i) =>
          changes && (
            <div
              key={i}
              className="border-zinc-700 md:rounded md:border md:p-4"
            >
              <GroupText group={group} changes={changes} />
              {changes.map((change, j) => (
                <SingleChange key={j} change={change} />
              ))}
            </div>
          ),
      )}
    </>
  )
}

function GroupText(props: { group: string; changes: Change[] }) {
  if (props.group === 'other') {
    return <span className="text-sm">Other changes</span>
  }

  const endpointId = props.group
  const chainId = getChainIdFromEndpointId(+endpointId)

  const text = props.changes.every(
    (change) => change.category === 'REMOTE_ADDED',
  )
    ? 'Added'
    : props.changes.length > 1
    ? 'Changes in'
    : 'Change in'

  return (
    <span className="mb-2 inline-block text-sm">
      <>
        {text} chain{' '}
        <span className="inline-block rounded-sm bg-green-800 px-1 py-0.5 text-green-500">
          {endpointId}
          {chainId && ` (${getPrettyChainName(chainId)})`}
        </span>{' '}
        configuration
      </>
    </span>
  )
}

function SingleChange(props: { change: Change }) {
  const path = [...props.change.parameterPath]
  const [isExpanded, setIsExpanded] = useState(false)

  //TODO: maybe we can get the description for this key

  return (
    <div className="mt-2 rounded-lg bg-neutral-700">
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-xs leading-normal">
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
        <div className="flex flex-col gap-3 pb-4 pl-4 pr-12">
          {props.change.previousValue && (
            <div className="flex items-center gap-2">
              <MinusIcon className="fill-zinc-500" />
              <Code className="bg-zinc-650 px-3 py-2">
                <span className="bg-red leading-tight">
                  {prettyJsonString(props.change.previousValue)}
                </span>
              </Code>
            </div>
          )}
          {props.change.currentValue && (
            <div className="flex items-center gap-2">
              <PlusIcon className="fill-zinc-500" />
              <Code className="bg-zinc-650 px-3 py-2">
                <span className="bg-green-700 leading-tight">
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
