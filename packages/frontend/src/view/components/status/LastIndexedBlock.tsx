import { DiscoveryStatus } from '@lz/libs'

import { Row } from './Row'
import { SubsectionHeader } from './SubsectionHeader'

export function LastIndexedBlock({
  block,
}: {
  block: DiscoveryStatus['lastIndexedBlock']
}) {
  if (!block) {
    return (
      <SubsectionHeader title="Last indexed block" subtitle="Data is missing" />
    )
  }

  const prettyTimestamp = `${block.timestamp.toNumber()} / ${block.timestamp
    .toDate()
    .toUTCString()}`

  const timestampDiff = Date.now() / 1000 - block.timestamp.toNumber()

  const prettyTimestampDiff = `${timestampDiff.toFixed(0)} seconds ago`

  return (
    <div>
      <SubsectionHeader title="Last indexed block" />
      <Row label="Block Number" value={block.blockNumber} />
      <Row label="Block Hash" value={block.blockHash.toString()} />
      <Row label="Timestamp" value={prettyTimestamp} />
      <Row label="Time elapsed from now" value={prettyTimestampDiff} />
    </div>
  )
}
