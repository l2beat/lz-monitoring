import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import { prettyDigitsGroups } from './statusUtils'
import { SubsectionHeader } from './SubsectionHeader'

export function NodeInformation({ status }: { status: DiscoveryStatus }) {
  if (status.state === 'disabled') {
    return (
      <SubsectionHeader title="Node information" subtitle="Module is offline" />
    )
  }

  if (!status.node) {
    return (
      <SubsectionHeader
        title="Node information"
        subtitle="Node did not respond"
      />
    )
  }

  const prettyTimestamp = `${status.node.blockTimestamp} / ${new Date(
    status.node.blockTimestamp * 1000,
  ).toUTCString()}`

  return (
    <>
      <SubsectionHeader title="Node information" />
      <Row
        label="Node latest block"
        value={prettyDigitsGroups(status.node.blockNumber)}
      />
      <Row label="Node latest timestamp" value={prettyTimestamp} />
    </>
  )
}
