import { EthereumAddress, RemoteChain } from '@lz/libs'

import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { InlineSkeleton } from '../Skeleton'
import { RemoteChainComponent } from './RemoteChain'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  treasuryContract?: EthereumAddress
  layerZeroToken?: EthereumAddress
  remoteChains?: RemoteChain[]
  isLoading: boolean
}

export function UltraLightNodeContract(props: Props): JSX.Element {
  if (props.isLoading) {
    return (
      <ProtocolComponentCard
        title="Ultra Light Node"
        subtitle={<InlineSkeleton />}
        accentColor="green"
      >
        <Row label="Owner" value={<InlineSkeleton />} />
        <Row label="Treasury Contract" value={<InlineSkeleton />} />
        <Row label="LayerZero token" value={<InlineSkeleton />} />
      </ProtocolComponentCard>
    )
  }

  return (
    <ProtocolComponentCard
      title="Ultra Light Node"
      subtitle={props.address}
      accentColor="green"
    >
      <RemoteChainComponent
        remoteChains={props.remoteChains}
        isLoading={false}
      />
      <Row label="Owner" value={props.owner} />
      <Row label="Treasury Contract" value={props.treasuryContract} />
      <Row label="LayerZero token" value={props.layerZeroToken} />
    </ProtocolComponentCard>
  )
}
