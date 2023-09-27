import { ChainId, getLzIdFromChainId } from '@lz/libs'

import { Dropdown, DropdownOption } from './Dropdown'

interface CurrentNetworkProps {
  chainId: ChainId
  setChainId: (chainId: ChainId) => void
  availableChains: ChainId[]
  latestBlock?: number
}

export function CurrentNetwork(props: CurrentNetworkProps): JSX.Element {
  const options = props.availableChains.map((availableChainId) => ({
    label: ChainId.getName(availableChainId),
    value: ChainId.getName(availableChainId),
  }))

  function onChange(option: DropdownOption): void {
    const chainId = ChainId.fromName(option.value)
    props.setChainId(chainId)
  }

  const defaultValue = options.find(
    (option) => option.value === ChainId.getName(props.chainId),
  )

  return (
    <section className="mb-12 bg-gray-900 p-6">
      <div className="mb-6">
        <label className="mb-4 text-xs text-gray-500">Select network</label>
        <Dropdown
          defaultValue={defaultValue}
          onChange={onChange}
          options={options}
        />
      </div>
      <div className="flex gap-6">
        {[
          { label: 'chain ID', value: props.chainId.toString() },
          { label: 'LZ chain ID', value: getLzIdFromChainId(props.chainId) },
          { label: 'Latest block', value: props.latestBlock },
        ].map(({ label, value }, i) => (
          <div
            className="flex flex-1 flex-col  items-center gap-3 bg-gray-800 pb-8 pt-6"
            key={i}
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
