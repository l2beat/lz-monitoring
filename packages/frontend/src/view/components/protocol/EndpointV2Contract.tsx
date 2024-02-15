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
      description="The Endpoint V2 description"
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
            label="Blocked Library"
            value={<BlockchainAddress address={props.blockedLibrary} />}
          />
          <EndpointV2RemoteChains
            defaultReceiveLibraries={props.defaultReceiveLibraries}
            defaultSendLibraries={props.defaultSendLibraries}
          />

          <Row label="EID" value={props.eid} />
          <Row
            label="Registered Libraries"
            value={
              <div className="flex flex-col gap-2">
                {props.registeredLibraries.map((rl) => (
                  <BlockchainAddress address={rl} />
                ))}
              </div>
            }
          />

          <Row
            label="LzToken"
            value={<BlockchainAddress address={props.lzToken} />}
          />
          <Row
            label="Native Token"
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
      {selectedChain && selectedLibraries && (
        <RemoteSection>
          <Row
            label="Default send library"
            value={
              <BlockchainAddress
                address={EthereumAddress(selectedLibraries.send)}
              />
            }
          />
          <Row
            label="Default receive library"
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
