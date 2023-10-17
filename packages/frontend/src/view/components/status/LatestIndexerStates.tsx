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
      <SubsectionHeader title="Latest indexer states" />
      {status.indexerStates.map((state) => {
        const prettyTimestamp = `${state.height} / ${new Date(
          state.height * 1000,
        ).toUTCString()}`
        return <Row label={state.id} key={state.id} value={prettyTimestamp} />
      })}
    </>
  )
}
