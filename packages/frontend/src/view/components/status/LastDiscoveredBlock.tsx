import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import {
  prettyDigitsGroups,
  prettyTimestamp,
  prettyTimestampDiff,
} from './statusUtils'
import { SubsectionHeader } from './SubsectionHeader'

export function LastDiscoveredBlock({ status }: { status: DiscoveryStatus }) {
  if (!status.lastDiscoveredBlock) {
    return (
      <SubsectionHeader
        title="Last discovered block"
        subtitle="Data has not yet been indexed"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Last discovered block" />
      <Row
        label="Block number"
        value={prettyDigitsGroups(status.lastDiscoveredBlock.blockNumber)}
      />
      <Row
        label="Timestamp"
        value={prettyTimestamp(status.lastDiscoveredBlock.timestamp)}
      />
      <Row
        label="Time elapsed from now"
        value={prettyTimestampDiff(status.lastDiscoveredBlock.timestamp)}
      />
    </>
  )
}
