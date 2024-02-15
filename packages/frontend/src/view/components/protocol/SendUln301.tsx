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
import { intersect } from './utils'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['sendUln301']

export function SendUln301Contract(props: Props) {
  return (
    <ProtocolComponentCard
      title="Send ULN 301"
      description="Contract responsible for outbound message verification for V1-based OApps. Stores default security stack configuration and default executor configuration for each configured chain path-way."
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
          <SendUln301RemoteChains
            defaultUlnConfigs={props.defaultUlnConfigs}
            defaultExecutorConfigs={props.defaultExecutorConfigs}
          />
          <Row
            label="Treasury Contract"
            value={<BlockchainAddress address={props.treasury} />}
          />
          <Row label="Version" value={props.version.join('.')} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}

function SendUln301RemoteChains(props: {
  defaultUlnConfigs: DiscoveryApi['contracts']['sendUln301']['defaultUlnConfigs']
  defaultExecutorConfigs: DiscoveryApi['contracts']['sendUln301']['defaultExecutorConfigs']
}) {
  const [selectedChain, setSelectedChain] = useState<ChainId>()

  const chains = intersect(
    props.defaultUlnConfigs,
    props.defaultExecutorConfigs,
  )
    .map(([endpointId]) => EndpointID.decodeV1(endpointId))
    .filter((maybeChainId): maybeChainId is ChainId => Boolean(maybeChainId))

  const selectedEid = selectedChain ? EndpointID.encodeV1(selectedChain) : null

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
