import { SafeMultisigTransaction, SafeTransactionDecodedData } from '@lz/libs'
import cx from 'classnames'
import React from 'react'

import { MinusIcon } from '../../icons/MinusIcon'
import { PlusIcon } from '../../icons/PlusIcon'
import { Code } from '../Code'
import { ExecutionTimeline } from '../ExecutionTimeline'
import { decodeCall, paramToSummary, toUTC } from './utils'

export function SafeMultisigTransactionComponent({
  tx,
  allTxs,
  amountOfOwners,
}: {
  tx: SafeMultisigTransaction
  allTxs: SafeMultisigTransaction[]
  amountOfOwners: number
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  // Data obtained from transaction payload itself
  const submissionDate = toUTC(tx.submissionDate)

  // It may be nullable in case of not executed transactions
  // typings are yet another time wrong
  const executionDate = tx.executionDate
    ? toUTC(tx.executionDate)
    : 'Not executed'
  const acquiredConfirmations = tx.confirmations?.length ?? 0
  const stringConfirmations = `${acquiredConfirmations}/${amountOfOwners}`
  const nonce = tx.nonce
  const blockNumber = tx.blockNumber ?? 'Not executed'
  const target = tx.to
  const rawData = tx.data ?? 'No Data'

  // Data obtained from decoding
  const decodedProperties = getDecodedProperties(tx)

  const method = decodedProperties?.method ?? 'Could not be decoded ⚠️'
  const callWithParams =
    decodedProperties?.callWithParams ?? 'Could not be decoded ⚠️'
  const params = decodedProperties?.params ?? []

  const paramsSummary = params.map((inlineSummary) => `${inlineSummary}\n`)

  const txStatus = getTransactionStatus(tx, allTxs)

  return (
    <div
      className={cx(
        'col-span-5 grid min-w-[800px] grid-cols-multisig border-b border-[#36393D] py-3 text-xs',
        isExpanded ? 'rounded border-none bg-gray-75' : 'bg-gray-500',
      )}
    >
      <div className="flex items-center px-6">
        {getTimeDifference(new Date(tx.submissionDate))}
      </div>
      <div className="flex items-center font-bold">{method}</div>
      <div className={cx('flex items-center', statusToTextColor(txStatus))}>
        {stringConfirmations}
      </div>
      <StatusBadge status={txStatus} />
      <div>
        <button
          className="flex h-[22px] w-[22px] items-center justify-center rounded bg-yellow-100 brightness-100 filter   transition-all duration-300 hover:brightness-[120%]"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MinusIcon /> : <PlusIcon />}
        </button>
      </div>

      {isExpanded && (
        <div className="col-span-5 mt-3">
          <Row label="Submission date" value={submissionDate} />
          <Row label="Execution date" value={executionDate} />
          <Row
            label="Confirmations"
            value={
              <ExecutionTimeline
                outcome={txStatus}
                submissionDate={new Date(submissionDate)}
                approvals={(tx.confirmations ?? [])
                  .map((t) => ({
                    signer: t.owner,
                    date: new Date(t.submissionDate),
                    method: t.signatureType,
                  }))
                  .sort((a, b) => b.date.getTime() - a.date.getTime())}
              />
            }
          />
          <Row label="Nonce" value={nonce} />
          <Row label="Block number" value={blockNumber} />
          <Row
            label="Target"
            value={<span className="font-mono">{target}</span>}
          />
          <Row
            label="Method"
            value={<Code>{decodedProperties?.signature}</Code>}
          />
          <Row label="Call with params" value={<Code>{callWithParams}</Code>} />
          <Row label="Calldata" value={<Code>{rawData}</Code>} />
          {paramsSummary.length > 0 && (
            <Row
              label="Decoded"
              value={
                <Code>
                  {params.map((inlineSummary) => (
                    <span className="leading-4">{inlineSummary}</span>
                  ))}
                </Code>
              }
            />
          )}
        </div>
      )}
    </div>
  )
}

function getDecodedProperties(tx: SafeMultisigTransaction) {
  const parsingResult = SafeTransactionDecodedData.safeParse(tx.dataDecoded)

  if (parsingResult.success && tx.dataDecoded) {
    // SafeApi kit typings are wrong, string type applies only for transport layer
    // string is later parsed into json object
    const decodedCall = decodeCall(
      tx.dataDecoded as unknown as NonNullable<SafeTransactionDecodedData>,
    )

    return {
      method: decodedCall.method,
      signature: decodedCall.signature,
      callWithParams: decodedCall.functionCall,
      params: decodedCall.params.map(paramToSummary),
    }
  }

  return null
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-row border-t border-[#4B4E51] py-4 pl-12 pr-8">
      <div className="w-1/5 text-sm font-medium text-gray-15">{label}</div>
      <div className="w-4/5 text-xs">{value}</div>
    </div>
  )
}

function getTimeDifference(date: Date) {
  const currentTime = Math.floor(Date.now() / 1000)
  const secondsDifference = currentTime - Math.floor(date.getTime() / 1000)

  const minute = 60
  const hour = minute * 60
  const day = hour * 24
  const week = day * 7
  const month = day * 30 // Approximate months as 30 days
  const year = day * 365 // Approximate years as 365 days

  function pluralSuffix(count: number) {
    return count > 1 ? 's' : ''
  }

  if (secondsDifference < minute) {
    return `${secondsDifference} second${pluralSuffix(secondsDifference)} ago`
  }
  if (secondsDifference < hour) {
    const minutes = Math.floor(secondsDifference / minute)
    return `${minutes} minute${pluralSuffix(minutes)} ago`
  }

  if (secondsDifference < day) {
    const hours = Math.floor(secondsDifference / hour)
    return `${hours} hour${pluralSuffix(hours)} ago`
  }

  if (secondsDifference < week) {
    const days = Math.floor(secondsDifference / day)
    return `${days} day${pluralSuffix(days)} ago`
  }

  if (secondsDifference < month) {
    const weeks = Math.floor(secondsDifference / week)
    return `${weeks} week${pluralSuffix(weeks)} ago`
  }

  if (secondsDifference < year) {
    const months = Math.floor(secondsDifference / month)
    return `${months} month${pluralSuffix(months)} ago`
  }

  const years = Math.floor(secondsDifference / year)
  return `${years} year${pluralSuffix(years)} ago`
}

type TransactionStatus = 'PENDING' | 'EXECUTED' | 'DISCARDED'

function getTransactionStatus(
  tx: SafeMultisigTransaction,
  allTxs: SafeMultisigTransaction[],
): TransactionStatus {
  if (tx.isExecuted) {
    return 'EXECUTED'
  }

  const sameNonceTransactions = allTxs.filter((t) => t.nonce === tx.nonce)

  if (sameNonceTransactions.length > 0) {
    return 'DISCARDED'
  }

  return 'PENDING'
}

function statusToBackgroundColor(status: TransactionStatus) {
  return status === 'PENDING'
    ? 'bg-[#D88641]'
    : status === 'EXECUTED'
    ? 'bg-[#4DA776]'
    : 'bg-[#E74C3C]'
}

function statusToTextColor(status: TransactionStatus) {
  return status === 'PENDING'
    ? 'text-[#D88641]'
    : status === 'EXECUTED'
    ? 'text-[#4DA776]'
    : 'text-[#E74C3C]'
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const bgColor = statusToBackgroundColor(status)

  return (
    <div
      className={cx(
        'flex h-[22px] max-w-fit items-center justify-center rounded px-2 text-2xs',
        bgColor,
      )}
    >
      {status}
    </div>
  )
}
