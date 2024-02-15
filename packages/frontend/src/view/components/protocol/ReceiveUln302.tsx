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
import { DefaultUln } from './remote/DefaultUln'
import { RemoteSection } from './remote/RemoteSection'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['receiveUln302']

export function ReceiveUln302Contract(props: Props) {
  return (
    <ProtocolComponentCard
      title="Receive ULN 302"
      description="Contract responsible for inbound message verification for V2-based OApps. Stores default security stack configuration for each configured chain path-way."
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
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
                warnOnEoa="Protocol component on this chain is owned by an EOA"
                address={props.owner}
              />
            }
          />
          <ReceiveUln302RemoteChains
            defaultUlnConfigs={props.defaultUlnConfigs}
          />
          <Row label="Message Lib Type" value={props.messageLibType} />
          <Row label="Version" value={props.version.join('.')} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}

function ReceiveUln302RemoteChains(props: {
  defaultUlnConfigs: DiscoveryApi['contracts']['receiveUln302']['defaultUlnConfigs']
}) {
  const [selectedChain, setSelectedChain] = useState<ChainId>()

  const chains = Object.keys(props.defaultUlnConfigs)
    .map((endpointId) => EndpointID.decodeV2(endpointId))
    .filter((maybeChainId): maybeChainId is ChainId => Boolean(maybeChainId))

  const selectedEid = selectedChain ? EndpointID.encodeV2(selectedChain) : null

  const selectedConfiguration = selectedEid
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      props.defaultUlnConfigs[selectedEid]!
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
          <DefaultUln config={selectedConfiguration} />
        </RemoteSection>
      )}
    </div>
  )
}
