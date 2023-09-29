import { DiscoveryEnabledStatus } from '@lz/libs'

import { Row } from './Row'
import { SubsectionHeader } from './SubsectionHeader'

export function NodeInformation({
  nodeInfo,
}: {
  nodeInfo: DiscoveryEnabledStatus['node'] | null
}) {
  if (!nodeInfo) {
    return (
      <SubsectionHeader title="Node information" subtitle="Data is missing" />
    )
  }

  const prettyTimestamp = `${nodeInfo.blockTimestamp} / ${new Date(
    nodeInfo.blockTimestamp * 1000,
  ).toUTCString()}`

  return (
    <div>
      <SubsectionHeader title="Node information" />
      <Row label="Node latest block" value={nodeInfo.blockNumber} />
      <Row label="Node latest timestamp" value={prettyTimestamp} />
    </div>
  )
}
