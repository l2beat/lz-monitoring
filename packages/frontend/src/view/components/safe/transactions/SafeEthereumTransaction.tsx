import { EthereumTxWithTransfersResponse } from '@safe-global/api-kit'

import { CodeRow } from '../CodeRow'
import { ExpandableRow } from '../ExpandableRow'
import { Row } from '../Row'
import { RowSection } from '../RowSection'
import { TokenTransfers } from '../tokens/TokenTransfer'
import { toUTC } from '../utils'

export { SafeEthereumTransaction }

function SafeEthereumTransaction({
  tx,
}: {
  tx: EthereumTxWithTransfersResponse
}) {
  return (
    <RowSection>
      <Row
        label="Transaction type"
        value={tx.txType ?? 'ETHEREUM_TRANSACTION'}
      />
      <Row label="Execution date" value={toUTC(tx.executionDate)} />
      <Row label="From" value={tx.from} />
      <Row label="To" value={tx.to} />
      <Row label="Hash" value={tx.txHash} />
      <Row label="Hash" value={tx.blockNumber ?? 'Not yet executed'} />
      <CodeRow label="Raw data">{tx.data}</CodeRow>
      <ExpandableRow title="Transfers">
        <TokenTransfers transfers={tx.transfers} />
      </ExpandableRow>
    </RowSection>
  )
}
