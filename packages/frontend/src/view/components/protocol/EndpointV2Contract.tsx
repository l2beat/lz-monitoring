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
import { RemoteSection } from './remote/RemoteSection'
import { intersect } from './utils'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['endpointV2']

export function EndpointV2Contract(props: Props) {
  return (
    <ProtocolComponentCard
      title="Endpoint V2"
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
      description="V2 variant of the Endpoint Contract backward compatible with V1. Contract handles the cross-chain messages transmission, verification, and receipt. It routes messages to the correct messaging library and keeps all message payloads across versions. Ownership of the contract can be renounced by the owner. Contract implements a standardized interface for Omnichain Applications (OApps) to manage security configurations and seamlessly send and receive messages."
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

          <Row
            hideBorder
            label={
              <InfoTooltip text="Library that reverts both on send and quote. Can be assigned as a default one actively stopping the message flow. It is configured upon contract construction and cannot be changed afterwards.">
                Blocked library
              </InfoTooltip>
            }
            value={<BlockchainAddress address={props.blockedLibrary} />}
          />
          <EndpointV2RemoteChains
            defaultReceiveLibraries={props.defaultReceiveLibraries}
            defaultSendLibraries={props.defaultSendLibraries}
          />

          <Row label="EID" value={props.eid} />
          <Row
            label={
              <InfoTooltip text="List of all registered message libraries. Message library must be appended to this registry before it can be used.">
                Registered libraries
              </InfoTooltip>
            }
            value={
              <div className="flex flex-col gap-2">
                {props.registeredLibraries.map((rl) => (
                  <BlockchainAddress address={rl} />
                ))}
              </div>
            }
          />

          <Row
            label="LayerZero token"
            value={<BlockchainAddress address={props.lzToken} />}
          />
          <Row
            label="Native token"
            value={<BlockchainAddress address={props.nativeToken} />}
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}

function EndpointV2RemoteChains(props: {
  defaultReceiveLibraries: DiscoveryApi['contracts']['endpointV2']['defaultReceiveLibraries']
  defaultSendLibraries: DiscoveryApi['contracts']['endpointV2']['defaultSendLibraries']
}) {
  const [selectedChain, setSelectedChain] = useState<ChainId>()

  const chains = intersect(
    props.defaultReceiveLibraries,
    props.defaultSendLibraries,
  )
    .map(([endpointId]) => EndpointID.decodeV2(endpointId))
    .filter((maybeChainId): maybeChainId is ChainId => Boolean(maybeChainId))

  const selectedEid = selectedChain ? EndpointID.encodeV2(selectedChain) : null

  const selectedLibraries = selectedEid
    ? {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        send: props.defaultSendLibraries[selectedEid]!,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        receive: props.defaultReceiveLibraries[selectedEid]!,
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
      {selectedChain && selectedLibraries && (
        <RemoteSection>
          <Row
            label={
              <InfoTooltip
                text={
                  'The default messaging library. The contract handles the message payload packing on the source chain. The owner of the Endpoint contract can change this value.'
                }
              >
                Default send library
              </InfoTooltip>
            }
            value={
              <BlockchainAddress
                address={EthereumAddress(selectedLibraries.send)}
              />
            }
          />
          <Row
            label={
              <InfoTooltip text="The default messaging library. The contract handles the message payload verification on the destination chain. The owner of the Endpoint contract can change this value.">
                Default receive library
              </InfoTooltip>
            }
            value={
              <BlockchainAddress
                address={EthereumAddress(selectedLibraries.receive)}
              />
            }
          />
        </RemoteSection>
      )}
    </div>
  )
}
