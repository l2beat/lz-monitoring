import { ChainId, DiscoveryApi, EndpointID } from '@lz/libs'
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
import { DefaultExecutorConfig } from './remote/DefaultExecutorConfig'
import { DefaultUln } from './remote/DefaultUln'
import { RemoteSection } from './remote/RemoteSection'
import { intersect, toV2LibType } from './utils'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['sendUln302']

export function SendUln302Contract(props: Props) {
  return (
    <ProtocolComponentCard
      title="Send ULN 302"
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
      description="Contract responsible for outbound message verification for V2-based OApps. Stores default security stack configuration and default executor configuration for each configured chain path-way."
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
            hideBorder
            label={
              <InfoTooltip text="Owner of this contract">Owner</InfoTooltip>
            }
            value={
              <BlockchainAddress
                warnOnEoa="This contract is owned by an EOA"
                address={props.owner}
              />
            }
          />
          <SendUln302RemoteChains
            defaultExecutorConfigs={props.defaultExecutorConfigs}
            defaultUlnConfigs={props.defaultUlnConfigs}
          />
          <Row
            label={
              <InfoTooltip text="The contract where all the fees are received. The owner can set a new treasury address.">
                Treasury Contract
              </InfoTooltip>
            }
            value={<BlockchainAddress address={props.treasury} />}
          />
          <Row
            label={
              <InfoTooltip text="Indicates for which direction library is used. Can be send, receive or both">
                Message lib type
              </InfoTooltip>
            }
            value={toV2LibType(props.messageLibType)}
          />
          <Row label="Version" value={props.version.join('.')} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}

function SendUln302RemoteChains(props: {
  defaultUlnConfigs: DiscoveryApi['contracts']['sendUln302']['defaultUlnConfigs']
  defaultExecutorConfigs: DiscoveryApi['contracts']['sendUln302']['defaultExecutorConfigs']
}) {
  const [selectedChain, setSelectedChain] = useState<ChainId>()

  const chains = intersect(
    props.defaultUlnConfigs,
    props.defaultExecutorConfigs,
  )
    .map(([endpointId]) => EndpointID.decodeV2(endpointId))
    .filter((maybeChainId): maybeChainId is ChainId => Boolean(maybeChainId))

  const selectedEid = selectedChain ? EndpointID.encodeV2(selectedChain) : null

  const selectedConfiguration = selectedEid
    ? {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        executor: props.defaultExecutorConfigs[selectedEid]!,
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
            Remote Chain
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
          <DefaultExecutorConfig config={selectedConfiguration.executor} />
          <DefaultUln config={selectedConfiguration.uln} />
        </RemoteSection>
      )}
    </div>
  )
}
