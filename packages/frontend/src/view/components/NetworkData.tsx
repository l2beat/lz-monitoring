import { ChainId, getEndpointIdFromChainId } from '@lz/libs'

import { MaxWidthLayout } from './Layout'

interface Props {
  chainId: ChainId
  latestBlock: number
}

export function NetworkData({ chainId, latestBlock }: Props): JSX.Element {
  return (
    <section className="mb-12 bg-gray-900 p-8">
      <MaxWidthLayout>
        <section className="flex flex-col gap-5 md:flex-row">
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
    <div className="flex flex-1 flex-col items-center gap-3 rounded-lg bg-gray-500 pb-8 pt-6">
      <label className="mb-3 text-xs text-gray-15">{label}</label>
      <span className="w-3/5 text-center text-xxl font-semibold">{value}</span>
    </div>
  )
}
