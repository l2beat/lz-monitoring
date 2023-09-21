import { EthereumAddress, RemoteChain } from '@lz/libs'
import { useState } from 'react'

import { Dropdown, DropdownOption } from './Dropdown'

interface EndpointContractProps {
  address?: EthereumAddress
  owner?: EthereumAddress
  treasuryContract?: EthereumAddress
  layerZeroToken?: EthereumAddress
  remoteChains?: RemoteChain[]
}

export function ULNv2Contract(props: EndpointContractProps): JSX.Element {
  return (
    <section className="mx-6 mb-12 border-t border-green-400 bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-green-400">
          Endpoint
        </h2>
        <span className="font-mono text-gray-600">{props.address}</span>
      </div>
      <RemoteChainComponent remoteChains={props.remoteChains} />
      {[
        { label: 'Owner', value: props.owner },
        { label: 'Treasury contract', value: props.treasuryContract },
        {
          label: 'LayerZero token',
          value: props.layerZeroToken,
        },
      ].map(({ label, value }) => (
        <div className="flex border-y border-black bg-gray-800 px-8 py-3">
          <span className="w-[214px] font-medium text-gray-500">{label}</span>
          <span className="font-mono">{value}</span>
        </div>
      ))}
    </section>
  )
}

interface RemoteChainProps {
  remoteChains?: RemoteChain[]
}

function RemoteChainComponent({
  remoteChains,
}: RemoteChainProps): JSX.Element | null {
  const [selectedChain, setSelectedChain] = useState<RemoteChain | null>(null)

  function onDropdownSelect(option: DropdownOption): void {
    const chain = remoteChains?.find((chain) => chain.name === option.value)

    if (!chain) return

    setSelectedChain(chain)
  }

  if (!remoteChains) return null

  const dropdownOptions = remoteChains.map((chain) => ({
    label: chain.name,
    value: chain.name,
  }))

  return (
    <div className="border-y border-black bg-gray-800 px-8 py-3">
      <div className="mb-0.5 flex h-10 items-center">
        <span className="w-[214px] font-medium text-gray-500">
          Remote chain
        </span>
        <Dropdown
          options={dropdownOptions}
          onChange={onDropdownSelect}
          className="grow self-stretch"
        />
      </div>
      {[
        { label: 'Default app config', value: selectedChain?.defaultAppConfig },
        {
          label: 'Default adapter params',
          value: selectedChain?.defaultAdapterParams,
        },
        {
          label: 'Inbound proof library',
          value: selectedChain?.inboundProofLibrary,
        },
        {
          label: 'Supported outbound proof',
          value: selectedChain?.supportedOutboundProof,
        },
      ].map(({ label, value }) => (
        <div className="mb-0.5 flex items-center">
          <span className="w-[214px] shrink-0 font-medium text-gray-500">
            {label}
          </span>
          <pre className="border-gray-700 grow overflow-auto border bg-gray-900 p-6 font-mono text-gray-500">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
      <div className="mb-0.5 flex items-center ">
        <span className="w-[214px] shrink-0 font-medium text-gray-500">
          Ultra light node
        </span>
        <span className="p-6 font-mono">{selectedChain?.uln}</span>
      </div>
    </div>
  )
}
