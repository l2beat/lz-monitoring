import { Row } from './Row'
import { SubsectionHeader } from './SubsectionHeader'

export function LastDiscoveredBlock({
  blockNumber,
}: {
  blockNumber: number | null
}) {
  if (!blockNumber) {
    return (
      <SubsectionHeader
        title="Last Discovered block"
        subtitle="Data is missing"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Last Discovered Block" />
      <Row label="Last discovered block" value={blockNumber} />
    </>
  )
}
