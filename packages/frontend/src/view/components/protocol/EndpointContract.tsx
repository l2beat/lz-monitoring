import { EthereumAddress } from '@lz/libs'

import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
}

export function EndpointContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard title="Endpoint" subtitle={props.address}>
      <Row label="Owner" value={props.owner} />
      <Row label="Default send library" value={props.defaultSendLibrary} />
      <Row
        label="Default receive library"
        value={props.defaultReceiveLibrary}
      />
    </ProtocolComponentCard>
  )
}
