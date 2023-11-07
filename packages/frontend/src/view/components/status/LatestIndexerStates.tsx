import { DiscoveryStatus } from '@lz/libs'

import { Row } from './StatusRow'
import { SubsectionHeader } from './SubsectionHeader'

export function LatestIndexerStates({ status }: { status: DiscoveryStatus }) {
  if (status.indexerStates.length === 0) {
    return (
      <SubsectionHeader
        title="Latest indexer states"
        subtitle="No indexer reported its state"
      />
    )
  }

  return (
    <>
      <SubsectionHeader
        title="Latest indexer states"
        subtitle="current height / latest block offset / node offset"
      />
      {status.indexerStates.map((state) => {
        const lastIndexedBlock = status.lastIndexedBlock?.blockNumber ?? 0
        const lastIndexedBlockOffset = lastIndexedBlock - state.height
        const nodeBlockTip =
          status.state === 'enabled' ? status.node?.blockNumber ?? 0 : 0
        const nodeBlockTipOffset = nodeBlockTip - state.height

        const prettyTimestamp = `${state.height} / ${lastIndexedBlockOffset} / ${nodeBlockTipOffset}`
        return <Row label={state.id} key={state.id} value={prettyTimestamp} />
      })}
    </>
  )
}
