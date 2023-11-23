import { DiscoveryStatus } from '@lz/libs'

import { prettyDigitsGroups } from './statusUtils'
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
      <table className="min-w-full text-center text-md [&>*:nth-child(even)]:bg-gray-800 [&>*:nth-child(odd)]:bg-gray-900">
        <tr className="h-[40px]">
          <th>Indexer</th>
          <th>Height</th>
          <th>Offset to latest block</th>
          <th>Offset to node tip</th>
        </tr>
        {status.indexerStates
          .sort((a, b) => a.height - b.height)
          .map((state) => {
            const lastIndexedBlock = status.lastIndexedBlock?.blockNumber ?? 0
            const lastIndexedBlockOffset = lastIndexedBlock - state.height
            const nodeBlockTip =
              status.state === 'enabled' ? status.node?.blockNumber ?? 0 : 0

            const nodeBlockTipOffset =
              status.state === 'enabled'
                ? prettyDigitsGroups(nodeBlockTip - state.height)
                : 'N/A'

            return (
              <tr className="h-[40px] font-mono">
                <td>{formatIndexerName(state.id)}</td>
                <td>{prettyDigitsGroups(state.height)}</td>
                <td>{prettyDigitsGroups(lastIndexedBlockOffset)}</td>
                <td>{nodeBlockTipOffset}</td>
              </tr>
            )
          })}
      </table>
    </>
  )
}

function formatIndexerName(name: string): string {
  const nameWithoutSuffix = name.replace('Indexer', '')
  return nameWithoutSuffix.replace(/([a-z])([A-Z])/g, '$1 $2')
}
