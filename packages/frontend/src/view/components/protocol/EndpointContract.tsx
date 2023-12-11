import { EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'

interface Props {
  address: EthereumAddress
  owner: EthereumAddress
  defaultSendLibrary: EthereumAddress
  defaultReceiveLibrary: EthereumAddress
  libraryLookup?: EthereumAddress[]
  isLoading?: boolean
}

export function EndpointContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard
      title="Endpoint"
      description="The Endpoint contract handles the cross-chain messages transmission, verification, and receipt. It routes messages to the correct messaging library and keeps all message payloads across versions. Ownership of the contract can be renounced by the owner."
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
            label="Owner"
            value={
              <BlockchainAddress
                warnOnEoa="Protocol on this chain is owned by an EOA"
                address={props.owner}
              />
            }
          />
          <Row
            label="Default send library"
            value={<BlockchainAddress address={props.defaultSendLibrary} />}
          />
          <Row
            label="Default receive library"
            value={<BlockchainAddress address={props.defaultSendLibrary} />}
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
