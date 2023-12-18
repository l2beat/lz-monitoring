import {
  EthereumAddress,
  SafeMultisigTransaction,
  SafeTransactionDecodedData,
} from '@lz/libs'
import cx from 'classnames'
import React from 'react'

import { SolidMinusIcon } from '../../icons/MinusIcon'
import { SolidPlusIcon } from '../../icons/PlusIcon'
import { BlockchainAddress } from '../BlockchainAddress'
import { BlockNumber } from '../BlockNumber'
import { Code } from '../Code'
import { ExecutionTimeline } from '../ExecutionTimeline'
import { TransactionHash } from '../TransactionHash'
import { decodeCall, paramToSummary, toUTC } from './utils'

export function SafeMultisigTransaction({
  transaction,
  allTransactions,
  amountOfOwners,
}: {
  transaction: SafeMultisigTransaction
  allTransactions: SafeMultisigTransaction[]
  amountOfOwners: number
}) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  // Data obtained from transaction payload itself
  const submissionDate = toUTC(transaction.submissionDate)

  // It may be nullable in case of not executed transactions
  // typings are yet another time wrong
  const executionDate = transaction.executionDate
    ? toUTC(transaction.executionDate)
    : 'Not executed'
  const acquiredConfirmations = transaction.confirmations?.length ?? 0
  const stringConfirmations = `${acquiredConfirmations}/${amountOfOwners}`
  const nonce = transaction.nonce
  const target = transaction.to
  const rawData = transaction.data ?? 'No Data'

  // Data obtained from decoding
  const decodedProperties = getDecodedProperties(transaction)

  const method = decodedProperties?.method ?? 'Could not be decoded ⚠️'
  const signature = decodedProperties?.signature ?? 'Could not be decoded ⚠️'
  const callWithParams =
    decodedProperties?.callWithParams ?? 'Could not be decoded ⚠️'
  const params = decodedProperties?.params ?? []

  const txStatus = getTransactionStatus(transaction, allTransactions)

  return (
    <div
      className={cx(
        'grid-cols-multisig-small col-span-full border-b border-gray-700 py-3 text-xs last:rounded-b last:border-none md:min-w-[800px] md:grid-cols-multisig  ',
        isExpanded ? 'rounded border-none bg-gray-750' : 'bg-gray-800',
      )}
    >
      <div
        className="grid-cols-multisig-small grid cursor-pointer md:min-w-[800px] md:grid-cols-multisig"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center px-4 md:px-6">
          {getTimeDifference(new Date(transaction.submissionDate))}
        </div>
        <div className="hidden items-center font-bold md:flex">{method}</div>
        <div className={cx('flex items-center', statusToTextColor(txStatus))}>
          {stringConfirmations}
        </div>
        <StatusBadge status={txStatus} />
        <button className="brightness-100 filter transition-all duration-300 hover:brightness-[120%]">
          {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
        </button>
      </div>

      {isExpanded && (
        <div className="col-span-full mt-3 cursor-auto">
          <TransactionProperty param="Submission date" value={submissionDate} />
          <TransactionProperty param="Execution date" value={executionDate} />
          {transaction.blockNumber && (
            <TransactionProperty
              param="Block number"
              value={
                <BlockNumber blockNumber={transaction.blockNumber} noStyle />
              }
            />
          )}
          {transaction.transactionHash && (
            <TransactionProperty
              param="Transaction hash"
              value={
                <TransactionHash
                  transactionHash={transaction.transactionHash}
                  noStyle
                />
              }
            />
          )}
          <TransactionProperty
            param="Confirmations"
            value={
              <ExecutionTimeline
                outcome={txStatus}
                submissionDate={new Date(submissionDate)}
                approvals={(transaction.confirmations ?? [])
                  .map((tx) => ({
                    signer: EthereumAddress(tx.owner),
                    date: new Date(tx.submissionDate),
                    method: tx.signatureType,
                  }))
                  .sort((a, b) => b.date.getTime() - a.date.getTime())}
              />
            }
          />
          <TransactionProperty param="Nonce" value={nonce} />
          <TransactionProperty
            param="Target"
            value={<BlockchainAddress address={EthereumAddress(target)} />}
          />
          <TransactionProperty param="Method" value={method} />
          <TransactionProperty
            param="Function signature"
            value={<Code>{signature}</Code>}
          />
          <TransactionProperty
            param="Call with params"
            value={<Code>{callWithParams}</Code>}
          />
          <TransactionProperty
            param="Raw calldata"
            value={<Code>{rawData}</Code>}
          />
          {params.length > 0 && (
            <TransactionProperty
              param="Decoded"
              value={
                <Code>
                  {params.map((inlineSummary) => (
                    <span className="leading-5">
                      {paramToSummary(inlineSummary).concat('\n')}
                    </span>
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
      params: decodedCall.params,
    }
  }

  return null
}

function TransactionProperty({
  param,
  value,
}: {
  param: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-2 border-t border-zinc-650 p-4 md:flex-row md:pl-12 md:pr-8">
      <div className="whitespace-nowrap text-sm font-medium text-zinc-200 md:w-1/5">
        {param}
      </div>
      <div className="text-xs md:w-4/5">{value}</div>
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
