import { ChainId, getLzIdFromChainId } from '@lz/libs'

interface Props {
  chainId: ChainId
  latestBlock: number
}

export function NetworkData({ chainId, latestBlock }: Props): JSX.Element {
  return (
    <ComponentLayout>
      <DataBlock label="Chain ID" value={chainId.toString()} />
      <DataBlock label="LZ chain ID" value={getLzIdFromChainId(chainId)} />
      <DataBlock label="Latest block" value={latestBlock} />
    </ComponentLayout>
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
    <div className="flex flex-1 flex-col items-center gap-3 bg-gray-800 pb-8 pt-6">
      <label className="mb-3 text-xs text-gray-500">{label}</label>
      <span className="w-3/5 text-center font-mono text-xxl">{value}</span>
    </div>
  )
}

function ComponentLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mb-12 bg-gray-900 p-6">
      <div className="flex gap-6">{children}</div>
    </section>
  )
}
