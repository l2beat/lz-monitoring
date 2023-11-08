import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import { prettyDigitsGroups } from './statusUtils'
import { SubsectionHeader } from './SubsectionHeader'

export function LastIndexedBlock({ status }: { status: DiscoveryStatus }) {
  if (!status.lastIndexedBlock) {
    return (
      <SubsectionHeader
        title="Last indexed block"
        subtitle="Data has not yet been indexed"
      />
    )
  }

  const { lastIndexedBlock } = status

  const prettyTimestamp = `${lastIndexedBlock.timestamp.toNumber()} / ${lastIndexedBlock.timestamp
    .toDate()
    .toUTCString()}`

  const timestampDiff =
    Date.now() / 1000 - lastIndexedBlock.timestamp.toNumber()

  const prettyTimestampDiff = `${timestampDiff.toFixed(0)} seconds ago`

  return (
    <>
      <SubsectionHeader title="Last indexed block" />
      <Row
        label="Block number"
        value={prettyDigitsGroups(lastIndexedBlock.blockNumber)}
      />
      <Row label="Block hash" value={lastIndexedBlock.blockHash.toString()} />
      <Row label="Timestamp" value={prettyTimestamp} />
      <Row label="Time elapsed from now" value={prettyTimestampDiff} />
    </>
  )
}
