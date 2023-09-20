interface CurrentNetworkProps {
  latestBlock?: number
}

export function CurrentNetwork(props: CurrentNetworkProps): JSX.Element {
  return (
    <section className="bg-gray-900 p-6">
      <div className="mb-6">
        {/* TODO: This will be a dropdown */}
        <label className="mb-4 text-xs text-gray-500">Current network</label>
        <h2 className="bg-gray-800 px-8 py-4 font-mono">Ethereum</h2>
      </div>
      <div className="flex gap-6">
        {[
          { label: 'chain ID', value: 1 },
          { label: 'LZ chain ID', value: 101 },
          { label: 'Latest block', value: props.latestBlock },
        ].map(({ label, value }) => (
          <div
            className="flex flex-1 flex-col  items-center gap-3 bg-gray-800 pb-8 pt-6"
            key={label}
          >
            <label className="mb-3 text-xs text-gray-500">{label}:</label>
            {/* TODO: add loading state */}
            <span className="font-mono text-xxl">{value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
