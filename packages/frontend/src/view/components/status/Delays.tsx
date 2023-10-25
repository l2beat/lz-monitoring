import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import { SubsectionHeader } from './SubsectionHeader'

export function Delays({ status }: { status: DiscoveryStatus }) {
  if (status.state === 'disabled') {
    return <SubsectionHeader title="Delays" subtitle="Module is offline" />
  }

  const hasIndexedAnyData =
    status.lastDiscoveredBlock && status.lastDiscoveredBlock

  if (!hasIndexedAnyData) {
    return (
      <SubsectionHeader
        title="Delays"
        subtitle="Data has not yet been indexed"
      />
    )
  }

  if (!status.delays) {
    return (
      <SubsectionHeader title="Delays" subtitle="No information available" />
    )
  }

  return (
    <>
      <SubsectionHeader title="Delays" />
      <Row label="Blocks behind the tip" value={status.delays.blocks} />
      <Row label="Discovery blocks to tip" value={status.delays.discovery} />
      <Row label="Offset between indexers" value={status.delays.offset} />
    </>
  )
}
