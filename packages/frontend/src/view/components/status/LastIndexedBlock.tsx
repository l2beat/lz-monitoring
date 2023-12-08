import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import {
  prettyDigitsGroups,
  prettyTimestamp,
  prettyTimestampDiff,
} from './statusUtils'
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

  return (
    <>
      <SubsectionHeader title="Last indexed block" />
      <Row
        label="Block number"
        value={prettyDigitsGroups(lastIndexedBlock.blockNumber)}
      />
      <Row label="Block hash" value={lastIndexedBlock.blockHash.toString()} />
      <Row
        label="Timestamp"
        value={prettyTimestamp(lastIndexedBlock.timestamp)}
      />
      <Row
        label="Time elapsed from now"
        value={prettyTimestampDiff(lastIndexedBlock.timestamp)}
      />
    </>
  )
}
