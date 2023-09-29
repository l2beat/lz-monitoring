import { DiscoveryStatus } from '@lz/libs'

import { Row } from './Row'
import { SubsectionHeader } from './SubsectionHeader'

export function LatestIndexerStates({
  indexerStates,
}: {
  indexerStates: DiscoveryStatus['indexerStates']
}) {
  if (indexerStates.length === 0) {
    return (
      <SubsectionHeader
        title="Latest indexer states"
        subtitle="Data is missing"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Latest indexer states" />
      {indexerStates.map((state) => {
        const prettyTimestamp = `${state.height} / ${new Date(
          state.height * 1000,
        ).toUTCString()}`
        return <Row label={state.id} value={prettyTimestamp} />
      })}
    </>
  )
}
