import {
  EthereumAddress,
  SafeMultisigTransaction,
  SafeTransactionDecodedData,
} from '@lz/libs'
import cx from 'classnames'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { MinusIcon } from '../../icons/MinusIcon'
import { PlusIcon } from '../../icons/PlusIcon'
import { Row } from '../Row'
import { RowSection } from '../RowSection'
import { InlineCodeSkeleton, InlineSkeleton } from '../Skeleton'
import { decodeCall, paramToSummary, toUTC } from './utils'

export function SafeMultisigTransactionComponent({
  tx,
  amountOfOwners,
  associatedAddresses,
}: {
  tx: SafeMultisigTransaction
  amountOfOwners: number
  associatedAddresses: EthereumAddress[]
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  // Data obtained from transaction payload itself
  const submissionDate = toUTC(tx.submissionDate)

  // It may be nullable in case of not executed transactions
  // typings are yet another time wrong
  const executionDate = tx.executionDate
    ? toUTC(tx.executionDate)
    : 'Not executed'
  const requiredConfirmations = tx.confirmationsRequired
  const acquiredConfirmations = tx.confirmations?.length ?? 0
  const stringConfirmations = `${acquiredConfirmations}/${amountOfOwners}`
  const executed = tx.isExecuted ? 'yes' : 'no'
  const successful = tx.isSuccessful ? 'yes' : 'no'
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

  const txStatus = getTransactionStatus(tx, [])

  if (true) {
    return (
      <tr className="border-y border-[#36393D] text-xs">
        <td className="py-3.5 pl-6">
          {getTimeDifference(new Date(tx.submissionDate))}
        </td>
        <td className="font-bold">{method}</td>
        <td className={cx(statusToTextColor(txStatus))}>
          {stringConfirmations}
        </td>
        <td>
          <StatusBadge status={txStatus} />
        </td>
        <td>
          <button
            className="flex h-[22px] w-[22px] items-center justify-center rounded bg-yellow"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <MinusIcon /> : <PlusIcon />}
          </button>
        </td>
        <>TEST</>
      </tr>
    )
  }

  // return (
  //   <ComponentLayout>
  //     <Row label="Submission date" value={submissionDate} />
  //     <Row label="Execution date" value={executionDate} />
  //     <Row label="Required confirmations" value={requiredConfirmations} />
  //     <Row label="Acquired confirmations" value={acquiredConfirmations} />
  //     <Row label="Executed" value={executed} />
  //     <Row label="Successful" value={successful} />

  //     <Row label="Nonce" value={nonce} />
  //     <Row label="Block number" value={blockNumber} />
  //     <Row label="Target" value={target} />
  //     <Row label="Method" value={<Code>{method}</Code>} />
  //     <Row label="Call with params" value={<Code>{callWithParams}</Code>} />
  //     <Row label="Raw data" value={<Code>{rawData}</Code>} />

  //     {paramsSummary.length > 0 && (
  //       <ExpandableRow className="mt-5" title="Params / Function calls">
  //         <Code>{params.map((inlineSummary) => `${inlineSummary}\n`)}</Code>
  //       </ExpandableRow>
  //     )}

  //     {tx.transfers.length > 0 && (
  //       <ExpandableRow className="mt-5" title="Transfers">
  //         <TokenTransfers
  //           transfers={tx.transfers}
  //           associatedAddresses={associatedAddresses}
  //         />
  //       </ExpandableRow>
  //     )}
  //   </ComponentLayout>
  // )
}

export function SafeMultisigTransactionSkeleton() {
  const inlinePropSkeletons = new Array(9)
    .fill(0)
    .map((_, i) => (
      <Row key={i} label={<Skeleton />} value={<InlineSkeleton />} />
    ))

  const codeSkeletons = new Array(3)
    .fill(0)
    .map((_, i) => (
      <Row key={i} label={<Skeleton />} value={<InlineCodeSkeleton />} />
    ))

  return (
    <ComponentLayout>
      {inlinePropSkeletons}
      {codeSkeletons}
    </ComponentLayout>
  )
}

function ComponentLayout({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="mb-10">
      <RowSection>{children}</RowSection>
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
        'flex max-w-fit items-center justify-center rounded px-2.5 py-1.5 text-[13px]',
        bgColor,
      )}
    >
      {status}
    </div>
  )
}
