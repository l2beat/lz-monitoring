import { EthereumAddress } from '@lz/libs'

import { ProtocolComponentCard } from '../ProtocolComponentCard'
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

export function EndpointContract(props: Props): JSX.Element {
  if (props.isLoading) {
    return (
      <ProtocolComponentCard
        title="Endpoint"
        subtitle={<InlineSkeleton />}
        accentColor="orange"
      >
        <Row label="Owner" value={<InlineSkeleton />} />
        <Row label="Default send library" value={<InlineSkeleton />} />
        <Row label="Default receive library" value={<InlineSkeleton />} />
      </ProtocolComponentCard>
    )
  }

  return (
    <ProtocolComponentCard
      title="Endpoint"
      subtitle={props.address}
      accentColor="orange"
    >
      <Row label="Owner" value={props.owner} />
      <Row label="Default send library" value={props.defaultSendLibrary} />
      <Row
        label="Default receive library"
        value={props.defaultReceiveLibrary}
      />
    </ProtocolComponentCard>
  )
}
