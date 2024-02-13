import { DiscoveryApi } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { Code } from '../Code'
import { ExpandableContainer } from '../ExpandableContainer'
import { InfoTooltip } from '../InfoTooltip'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { UpdatableBadge, V2Badge } from './Badges'

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
                warnOnEoa="Protocol on this chain is owned by an EOA"
                address={props.owner}
              />
            }
          />

          <Row
            label="Blocked Library"
            value={<BlockchainAddress address={props.blockedLibrary} />}
          />
          <Row
            label="Default Receive Libraries"
            value={<Code>{JSON.stringify(props.defaultReceiveLibraries)}</Code>}
          />
          <Row
            label="Default Send Libraries"
            value={<Code>{JSON.stringify(props.defaultSendLibraries)}</Code>}
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
