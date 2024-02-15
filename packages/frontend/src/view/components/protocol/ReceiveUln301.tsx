import { ChainId, DiscoveryApi, EndpointID, EthereumAddress } from '@lz/libs'
import { useState } from 'react'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChainDropdown } from '../ChainDropdown'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { InfoTooltip } from '../InfoTooltip'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { UpdatableBadge, V2Badge } from './Badges'
import { Block } from './remote/Block'
import { DefaultUln } from './remote/DefaultUln'
import { RemoteSection } from './remote/RemoteSection'
import { intersect } from './utils'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['receiveUln301']

export function ReceiveUln301Contract(props: Props) {
  return (
    <ProtocolComponentCard
      title="Receive ULN 301"
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
      description="ULN 301 Receive for apps"
      subtitle={<BlockchainAddress address={props.address} full />}
      isLoading={props.isLoading}
    >
      <ChangelogSummary address={props.address} />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row
            label={
              <InfoTooltip text="Owner of the Endpoint Contract">
                Owner
              </InfoTooltip>
            }
            value={
              <BlockchainAddress
                warnOnEoa="Protocol component on this chain is owned by an EOA"
                address={props.owner}
              />
            }
          />
          <ReceiveUln301RemoteChains {...props} />
          <Row label="Version" value={props.version.join('.')} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}

function ReceiveUln301RemoteChains(props: {
  defaultUlnConfigs: DiscoveryApi['contracts']['receiveUln301']['defaultUlnConfigs']
  defaultExecutors: DiscoveryApi['contracts']['receiveUln301']['defaultExecutors']
}) {
  const [selectedChain, setSelectedChain] = useState<ChainId>()

  const chains = intersect(props.defaultUlnConfigs, props.defaultExecutors)
    .map(([endpointId]) => EndpointID.decodeV1(endpointId))
    .filter((maybeChainId): maybeChainId is ChainId => Boolean(maybeChainId))

  const selectedEid = selectedChain ? EndpointID.encodeV1(selectedChain) : null

  const selectedConfiguration = selectedEid
    ? {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        executor: props.defaultExecutors[selectedEid]!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        uln: props.defaultUlnConfigs[selectedEid]!,
      }
    : null

  return (
    <div className="mx-2 rounded-lg bg-zinc-300">
      <Row
        hideBorder
        className="!px-3 md:!px-6"
        label={
          <InfoTooltip text="List of send/receive chain pathways configured">
            Remote chains
          </InfoTooltip>
        }
        value={
          chains.length > 0 ? (
            <ChainDropdown
              chains={chains}
              selectedChainId={selectedChain}
              setSelectedChainId={setSelectedChain}
            />
          ) : (
            <div className="text-right text-gray-100">
              There are no supported path-ways to display for this chain
            </div>
          )
        }
      />
      {selectedChain && selectedConfiguration && (
        <RemoteSection>
          <Block title="Default executor">
            <Row
              label="Executor"
              value={
                <BlockchainAddress
                  address={EthereumAddress(selectedConfiguration.executor)}
                />
              }
            />
          </Block>
          <DefaultUln config={selectedConfiguration.uln} />
        </RemoteSection>
      )}
    </div>
  )
}
