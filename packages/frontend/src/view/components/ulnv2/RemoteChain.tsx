import { ChainId, RemoteChain } from '@lz/libs'
import Skeleton from 'react-loading-skeleton'

import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { Dropdown, DropdownOption } from '../Dropdown'
import { Code } from '../safe/Code'
import { Row } from './Row'
import { toDropdownOption } from './utils'

interface Props {
  remoteChains?: RemoteChain[]
  isLoading?: boolean
}

export function RemoteChainComponent({
  remoteChains,
  isLoading,
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

  if (isLoading) {
    const codeSkeleton = (
      <Code>
        <Skeleton count={5} className="my-1" />
      </Code>
    )

    const addressSkeleton = <Skeleton width="350px" />

    return (
      <ComponentLayout>
        <div className="mb-0.5 flex h-10 items-center">
          <Row label="Remote chain" value={addressSkeleton} />
        </div>
        <Row label="Default app config" value={codeSkeleton} />
        <Row label="Default adapter params" value={codeSkeleton} />
        <Row label="Inbound proof library" value={codeSkeleton} />
        <Row label="Supported outbound proof" value={codeSkeleton} />

        <Row label="Ultra Light Node" value={addressSkeleton} />
      </ComponentLayout>
    )
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
    <ComponentLayout>
      <div className="mb-0.5 flex h-10 items-center">
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
      </div>

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

      <Row label="Ultra Light Node" value={remoteChain.uln} />
    </ComponentLayout>
  )
}

function ComponentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-y border-black bg-gray-800 py-3">{children}</div>
  )
}
