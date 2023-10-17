import { EthereumAddress, RemoteChain } from '@lz/libs'
import Skeleton from 'react-loading-skeleton'

import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { RemoteChainComponent } from './RemoteChain'
import { Row } from './Row'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  treasuryContract?: EthereumAddress
  layerZeroToken?: EthereumAddress
  remoteChains?: RemoteChain[]
  isLoading: boolean
}

export function ULNv2Contract(props: Props): JSX.Element {
  if (props.isLoading) {
    const addressSkeleton = <Skeleton width="350px" />

    return (
      <ProtocolComponentCard
        title="Ulta Light Node"
        subtitle={addressSkeleton}
        accentColor="green"
      >
        <RemoteChainComponent
          remoteChains={props.remoteChains}
          isLoading={true}
        />
        <Row label="Owner" value={addressSkeleton} />
        <Row label="Treasury Contract" value={addressSkeleton} />
        <Row label="LayerZero token" value={addressSkeleton} />
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
