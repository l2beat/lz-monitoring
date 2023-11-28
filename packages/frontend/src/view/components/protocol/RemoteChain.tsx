import { ChainId, RemoteChain } from '@lz/libs'

import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { BlockchainAddress } from '../BlockchainAddress'
import { Code } from '../Code'
import { Dropdown, DropdownOption } from '../Dropdown'
import { Row } from '../Row'
import { toDropdownOption } from './utils'

interface Props {
  remoteChains?: RemoteChain[]
}

export function RemoteChainComponent({
  remoteChains,
}: Props): JSX.Element | null {
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

  if (!remoteChain) {
    return null
  }

  return (
    <div>
      <Row
        label="Remote chain"
        value={
          <Dropdown
            defaultValue={toDropdownOption(selectedChain)}
            options={dropdownOptions}
            onChange={onDropdownSelect}
            className="w-full"
          />
        }
      />

      <Row
        label="Default app config"
        value={
          <Code>{JSON.stringify(remoteChain.defaultAppConfig, null, 2)}</Code>
        }
      />

      <Row
        label="Default adapter params"
        value={
          <Code>
            {JSON.stringify(remoteChain.defaultAdapterParams, null, 2)}
          </Code>
        }
      />

      <Row
        label="Inbound proof library"
        value={
          <Code>
            {JSON.stringify(remoteChain.inboundProofLibrary, null, 2)}
          </Code>
        }
      />
      <Row
        label="Supported outbound proof"
        value={
          <Code>
            {JSON.stringify(remoteChain.supportedOutboundProof, null, 2)}
          </Code>
        }
      />
      <Row
        label="Ultra Light Node"
        value={<BlockchainAddress address={remoteChain.uln} />}
      />
    </div>
  )
}
