import { ChainId, EthereumAddress, RemoteChain } from '@lz/libs'

import { useChainQueryParam } from '../../hooks/useChainQueryParam'
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
    <section className="mx-6 mb-12 border-t border-green bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-green">
          UltraLightNodeV2
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
      ].map(({ label, value }, i) => (
        <div
          className="flex border-y border-black bg-gray-800 px-8 py-3"
          key={i}
        >
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
  const [selectedChain, setSelectedChain] = useChainQueryParam({
    fallback: ChainId.ETHEREUM,
    paramName: 'remote-chain',
  })

  function onDropdownSelect(option: DropdownOption): void {
    const chain = remoteChains?.find((chain) => chain.name === option.value)

    if (!chain) {
      return
    }

    setSelectedChain(ChainId.fromName(chain.name))
  }

  if (!remoteChains) {
    return null
  }

  const dropdownOptions = remoteChains.map(toDropdownOption)

  const remoteChain = remoteChains.find(
    (chain) => chain.name === ChainId.getName(selectedChain),
  )

  return (
    <div className="border-y border-black bg-gray-800 px-8 py-3">
      <div className="mb-0.5 flex h-10 items-center">
        <span className="w-[214px] font-medium text-gray-500">
          Remote chain
        </span>
        <Dropdown
          defaultValue={toDropdownOption(selectedChain)}
          options={dropdownOptions}
          onChange={onDropdownSelect}
          className="grow self-stretch"
        />
      </div>
      {[
        {
          label: 'Default app config',
          value: remoteChain?.defaultAppConfig,
        },
        {
          label: 'Default adapter params',
          value: remoteChain?.defaultAdapterParams,
        },
        {
          label: 'Inbound proof library',
          value: remoteChain?.inboundProofLibrary,
        },
        {
          label: 'Supported outbound proof',
          value: remoteChain?.supportedOutboundProof,
        },
      ].map(({ label, value }, i) => (
        <div className="mb-0.5 flex items-center" key={i}>
          <span className="w-[214px] shrink-0 font-medium text-gray-500">
            {label}
          </span>
          <pre className="grow overflow-auto border border-gray-700 bg-gray-900 p-6 font-mono text-gray-500">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      ))}
      <div className="mb-0.5 flex items-center ">
        <span className="w-[214px] shrink-0 font-medium text-gray-500">
          Ultra light node
        </span>
        <span className="p-6 font-mono">{remoteChain?.uln}</span>
      </div>
    </div>
  )
}

function toDropdownOption(chain: RemoteChain | ChainId): DropdownOption {
  if (ChainId.isChainId(chain)) {
    const name = ChainId.getName(chain)
    return {
      label: name,
      value: name,
    }
  }

  return {
    label: chain.name,
    value: chain.name,
  }
}
