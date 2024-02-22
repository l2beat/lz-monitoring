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
      description="Contract responsible for inbound message verification for V1-based application. Stores default security stack configuration and list of default executors for each configured chain path-way."
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
      subtitle={<BlockchainAddress address={props.address} full />}
      isLoading={props.isLoading}
    >
      <ChangelogSummary address={props.address} showFilters groupedEntries />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row
            hideBorder
            label={
              <InfoTooltip text="Owner of this contract.">Owner</InfoTooltip>
            }
            value={
              <BlockchainAddress
                warnOnEoa="This contract is owned by an EOA."
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
          <InfoTooltip text="List of destination chains supported by this site.">
            Remote chain
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
              dense
              label={
                <InfoTooltip text="Party responsible for dispatching the message to the target chain after it has been signed-off by the security stack.">
                  Executor
                </InfoTooltip>
              }
              className="!p-0 md:!pl-7 md:!pr-4"
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
