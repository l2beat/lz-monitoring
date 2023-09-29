import { DiscoveryEnabledStatus } from '@lz/libs'

import { Row } from './Row'
import { SubsectionHeader } from './SubsectionHeader'

export function Delays({
  delays: { blocks, offset, discovery },
}: {
  delays: DiscoveryEnabledStatus['delays']
}) {
  return (
    <div>
      <SubsectionHeader title="Delays" />
      {blocks && <Row label="Blocks behind the tip" value={blocks} />}
      {discovery && <Row label="Discovery blocks to tip" value={discovery} />}
      {offset && <Row label="Offset between indexers" value={offset} />}
    </div>
  )
}
