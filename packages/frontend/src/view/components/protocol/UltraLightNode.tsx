import { EthereumAddress, RemoteChain } from '@lz/libs'

import { cardFor } from '../cardFor'
import { Row } from '../Row'
import { RemoteChainComponent } from './RemoteChain'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  treasuryContract?: EthereumAddress
  layerZeroToken?: EthereumAddress
  remoteChains?: RemoteChain[]
}

const Card = cardFor('Ultra Light Node', 'green')

export function UltraLightNodeContract(props: Props): JSX.Element {
  return (
    <Card subtitle={props.address}>
      <RemoteChainComponent remoteChains={props.remoteChains} />
      <Row label="Owner" value={props.owner} />
      <Row label="Treasury Contract" value={props.treasuryContract} />
      <Row label="LayerZero token" value={props.layerZeroToken} />
    </Card>
  )
}
