import {
  EthereumAddress,
  SafeMultisigTransaction,
  SafeTransactionDecodedData,
} from '@lz/libs'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { Code } from './Code'
import { ExpandableRow } from './ExpandableRow'
import { Row } from './Row'
import { RowSection } from './RowSection'
import { TokenTransfers } from './TokenTransfer'
import { decodeCall, paramToSummary, toUTC } from './utils'

export function SafeMultisigTransactionComponent({
  tx,
  associatedAddresses,
}: {
  tx: SafeMultisigTransaction
  associatedAddresses: EthereumAddress[]
}) {
  // Data obtained from transaction payload itself
  const transactionType = 'Multisig Transaction'
  const submissionDate = toUTC(tx.submissionDate)
  const requiredConfirmations = tx.confirmationsRequired
  const acquiredConfirmations = tx.confirmations?.length ?? 0
  const executed = tx.isExecuted ? 'yes' : 'no'
  const successful = tx.isSuccessful ? 'yes' : 'no'
  const nonce = tx.nonce
  const blockNumber = tx.blockNumber ?? 'Not yet executed'
  const target = tx.to
  const rawData = tx.data ?? 'No Data'

  // Data obtained from decoding
  const decodedProperties = getDecodedProperties(tx)

  const method = decodedProperties?.method ?? 'Could not be decoded ⚠️'
  const callWithParams =
    decodedProperties?.callWithParams ?? 'Could not be decoded ⚠️'
  const params = decodedProperties?.params ?? []

  const paramsSummary = params.map((inlineSummary) => `${inlineSummary}\n`)

  return (
    <ComponentLayout>
      <Row label="Transaction type" value={transactionType} />
      <Row label="Submission date" value={submissionDate} />
      <Row label="Required confirmations" value={requiredConfirmations} />
      <Row label="Acquired confirmations" value={acquiredConfirmations} />
      <Row label="Executed" value={executed} />
      <Row label="Successful" value={successful} />

      <Row label="Nonce" value={nonce} />
      <Row label="Block number" value={blockNumber} />
      <Row label="Target" value={target} />
      <Row label="Method" value={<Code>{method}</Code>} />
      <Row label="Call with params" value={<Code>{callWithParams}</Code>} />
      <Row label="Raw data" value={<Code>{rawData}</Code>} />

      {paramsSummary.length > 0 && (
        <ExpandableRow className="mt-5" title="Params / Function calls">
          <Code>{params.map((inlineSummary) => `${inlineSummary}\n`)}</Code>
        </ExpandableRow>
      )}

      {tx.transfers.length > 0 && (
        <ExpandableRow className="mt-5" title="Transfers">
          <TokenTransfers
            transfers={tx.transfers}
            associatedAddresses={associatedAddresses}
          />
        </ExpandableRow>
      )}
    </ComponentLayout>
  )
}

export function SafeMultisigTransactionSkeleton() {
  const inlinePropSkeletons = new Array(9)
    .fill(0)
    .map((_, i) => <Row key={i} label={<Skeleton />} value={<Skeleton />} />)

  const codeSkeletons = new Array(3).fill(0).map((_, i) => (
    <Row
      key={i}
      label={<Skeleton />}
      value={
        <Code>
          <Skeleton />
        </Code>
      }
    />
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
      method: decodedCall.signature,
      callWithParams: decodedCall.functionCall,
      params: decodedCall.params.map(paramToSummary),
    }
  }

  return null
}
