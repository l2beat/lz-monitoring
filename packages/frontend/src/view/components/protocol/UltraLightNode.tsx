import { EthereumAddress, RemoteChain } from '@lz/libs'

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

// const Card = cardFor('Ultra Light Node', 'green')

export function UltraLightNodeContract(props: Props): JSX.Element {
  if (props.isLoading) {
    return (
      <div>
        {/* // <Card subtitle={<InlineSkeleton />}> */}
        <RemoteChainComponent
          remoteChains={props.remoteChains}
          isLoading={true}
        />
        <Row label="Owner" value={<InlineSkeleton />} />
        <Row label="Treasury Contract" value={<InlineSkeleton />} />
        <Row label="LayerZero token" value={<InlineSkeleton />} />
      </div>
      // </Card>
    )
  }

  return (
    <>
      {/* // <Card subtitle={props.address}> */}
      <RemoteChainComponent
        remoteChains={props.remoteChains}
        isLoading={false}
      />
      <Row label="Owner" value={props.owner} />
      <Row label="Treasury Contract" value={props.treasuryContract} />
      <Row label="LayerZero token" value={props.layerZeroToken} />
      {/* </Card> */}
    </>
  )
}
