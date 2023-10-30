import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import { SubsectionHeader } from './SubsectionHeader'

export function LastIndexedBlockForEvents({
  status,
}: {
  status: DiscoveryStatus
}) {
  if (!status.lastIndexedBlockForEvents) {
    return (
      <SubsectionHeader
        title="Last indexed block for events"
        subtitle="Data has not yet been indexed"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Last indexed block for events" />
      <Row
        label="Last indexed block"
        value={status.lastIndexedBlockForEvents}
      />
    </>
  )
}
