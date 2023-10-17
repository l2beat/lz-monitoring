import { EthereumAddress } from '@lz/libs'

import { cardFor } from '../cardFor'
import { Row } from '../Row'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
}

const Card = cardFor('Endpoint', 'orange')

export function EndpointContract(props: Props): JSX.Element {
  return (
    <Card subtitle={props.address}>
      <Row label="Owner" value={props.owner} />
      <Row label="Default send library" value={props.defaultSendLibrary} />
      <Row
        label="Default receive library"
        value={props.defaultReceiveLibrary}
      />
    </Card>
  )
}
