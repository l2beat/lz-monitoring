import { DataDecoded } from '@lz/libs'
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/api-kit'

import { Code } from '../Code'
import { CodeRow } from '../CodeRow'
import { ExpandableRow } from '../ExpandableRow'
import { Row } from '../Row'
import { RowSection } from '../RowSection'
import { TokenTransfers } from '../tokens/TokenTransfer'
import { decodeToTCall, paramToSummary, toUTC } from '../utils'

export { SafeMultisigTransaction }

function SafeMultisigTransaction({
  tx,
}: {
  tx: SafeMultisigTransactionWithTransfersResponse
}) {
  const decodedData = DataDecoded.parse(tx.dataDecoded)

  if (!decodedData) {
    return (
      <div className="mb-10">
        <Row label="Transaction type" value={tx.txType ?? 'No type'} />
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
            <TokenTransfers transfers={tx.transfers} />
          </ExpandableRow>
        )}
      </div>
    )
  }

  const call = decodeToTCall(decodedData)

  return (
    <div className="mb-10">
      <RowSection>
        <Row label="Transaction type" value={tx.txType ?? 'No type'} />
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
            <TokenTransfers transfers={tx.transfers} />
          </ExpandableRow>
        )}
      </RowSection>
    </div>
  )
}
