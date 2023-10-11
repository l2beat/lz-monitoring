import { DataDecoded, EthereumAddress, SafeMultisigTransaction } from '@lz/libs'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { Code } from '../Code'
import { CodeRow } from '../CodeRow'
import { ExpandableRow } from '../ExpandableRow'
import { ComponentRow, Row } from '../Row'
import { RowSection } from '../RowSection'
import { TokenTransfers } from '../tokens/TokenTransfer'
import { decodeToTCall, paramToSummary, toUTC } from '../utils'

export { SafeMultisigTransactionComponent, SafeMultisigTransactionSkeleton }

function SafeMultisigTransactionComponent({
  tx,
  associatedAddresses,
}: {
  tx: SafeMultisigTransaction
  associatedAddresses: EthereumAddress[]
}) {
  const decodedData = DataDecoded.parse(tx.dataDecoded)

  if (!decodedData) {
    return (
      <ComponentLayout>
        <Row label="Transaction type" value="Multisig Transaction" />
        <Row
          label="Submission date"
          value={new Date(tx.submissionDate).toUTCString()}
        />
        <Row label="Required confirmations" value={tx.confirmationsRequired} />
        {tx.confirmations?.length && (
          <Row label="Acquired confirmations" value={tx.confirmations.length} />
        )}
        <Row label="Executed" value={tx.isExecuted ? 'yes' : 'no'} />
        <Row label="Successful" value={tx.isSuccessful ? 'yes' : 'no'} />

        <Row label="Nonce" value={tx.nonce} />
        <Row label="Block number" value={tx.blockNumber ?? 'No block'} />
        <Row label="Target" value={tx.to} />
        <CodeRow label="Method">Could not be decoded ⚠️</CodeRow>
        <CodeRow label="Call with params">Could not be decoded ⚠️</CodeRow>
        <CodeRow label="Raw data">{tx.data ?? 'No Data'}</CodeRow>
        {tx.transfers.length > 0 && (
          <ExpandableRow title="Transfers">
            <TokenTransfers
              transfers={tx.transfers}
              associatedAddresses={associatedAddresses}
            />
          </ExpandableRow>
        )}
      </ComponentLayout>
    )
  }

  const call = decodeToTCall(decodedData)

  return (
    <ComponentLayout>
      <Row label="Transaction type" value="Multisig Transaction" />
      <Row label="Submission date" value={toUTC(tx.submissionDate)} />
      <Row label="Required confirmations" value={tx.confirmationsRequired} />
      {tx.confirmations?.length && (
        <Row label="Acquired confirmations" value={tx.confirmations.length} />
      )}
      <Row label="Executed" value={tx.isExecuted ? 'yes' : 'no'} />
      <Row label="Successful" value={tx.isSuccessful ? 'yes' : 'no'} />

      <Row label="Nonce" value={tx.nonce} />
      <Row label="Block number" value={tx.blockNumber ?? 'No block'} />
      <Row label="Target" value={tx.to} />
      <CodeRow label="Method">{call.signature}</CodeRow>
      <CodeRow label="Call with params">{call.functionCall}</CodeRow>

      <ExpandableRow cls="mt-5" title="Params / Function calls">
        <Code>
          {call.params
            .map(paramToSummary)
            .map((inlineSummary) => `${inlineSummary}\n`)}
        </Code>
      </ExpandableRow>
      {tx.transfers.length > 0 && (
        <ExpandableRow cls="mt-5" title="Transfers">
          <TokenTransfers
            transfers={tx.transfers}
            associatedAddresses={associatedAddresses}
          />
        </ExpandableRow>
      )}
    </ComponentLayout>
  )
}

function SafeMultisigTransactionSkeleton() {
  const skeletons = new Array(10)
    .fill(0)
    .map((_, i) => (
      <ComponentRow
        key={i}
        label={<Skeleton />}
        value={<Skeleton width="95%" />}
      />
    ))
  return <ComponentLayout>{skeletons}</ComponentLayout>
}

function ComponentLayout({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="mb-10">
      <RowSection>{children}</RowSection>
    </div>
  )
}
