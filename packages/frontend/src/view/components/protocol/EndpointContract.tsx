import { ChainId, EthereumAddress } from '@lz/libs'

import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'

interface Props {
  chainId: ChainId
  address: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
}

export function EndpointContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard title="Endpoint" subtitle={props.address}>
      <ChangelogSummary chainId={props.chainId} address={props.address} />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row label="Owner" value={props.owner} />
          <Row label="Default send library" value={props.defaultSendLibrary} />
          <Row
            label="Default receive library"
            value={props.defaultReceiveLibrary}
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
