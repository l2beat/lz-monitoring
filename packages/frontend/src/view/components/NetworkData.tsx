import { getEndpointIdFromChainId } from '@lz/libs'

import { useChainId } from '../../hooks/chainIdContext'
import { MaxWidthLayout } from './Layout'

interface Props {
  latestBlock: number
}

export function NetworkData({ latestBlock }: Props): JSX.Element {
  const chainId = useChainId()
  return (
    <section className="mb-4 bg-gray-900 p-4 md:mb-10 md:p-8">
      <MaxWidthLayout>
        <section className="flex items-stretch gap-2.5 md:gap-5">
          <DataBlock label="Chain ID" value={chainId.toString()} />
          <DataBlock
            label="Endpoint ID"
            value={getEndpointIdFromChainId(chainId)}
          />
          <DataBlock label="Latest block" value={latestBlock} />
        </section>
      </MaxWidthLayout>
    </section>
  )
}

function DataBlock({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-gray-500 px-2 py-4 md:pb-8 md:pt-6">
      <label className="mb-3 text-xs text-gray-15">{label}</label>
      <span className="text-md font-semibold md:text-xxl">{value}</span>
    </div>
  )
}
