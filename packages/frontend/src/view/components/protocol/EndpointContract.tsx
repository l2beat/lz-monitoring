import { EthereumAddress } from '@lz/libs'

import { cardFor } from '../cardFor'
import { Row } from '../Row'
import { InlineSkeleton } from '../Skeleton'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
  isLoading: boolean
}

const Card = cardFor('Endpoint', 'orange')

export function EndpointContract(props: Props): JSX.Element {
  if (props.isLoading) {
    return (
      <Card subtitle={<InlineSkeleton />}>
        <Row label="Owner" value={<InlineSkeleton />} />
        <Row label="Default send library" value={<InlineSkeleton />} />
        <Row label="Default receive library" value={<InlineSkeleton />} />
      </Card>
    )
  }

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
