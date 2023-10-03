import { DiscoveryStatus } from '@lz/libs'

import { Row } from './Row'
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
      <Row label="Last discovered block" value={status.lastDiscoveredBlock} />
    </>
  )
}
