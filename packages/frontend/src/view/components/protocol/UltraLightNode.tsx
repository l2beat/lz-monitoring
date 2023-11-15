import { EthereumAddress, RemoteChain } from '@lz/libs'

import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { RemoteChainComponent } from './RemoteChain'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  treasuryContract?: EthereumAddress
  layerZeroToken?: EthereumAddress
  remoteChains?: RemoteChain[]
}

export function UltraLightNodeContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard title="UltraLight Node V2" subtitle={props.address}>
      <RemoteChainComponent remoteChains={props.remoteChains} />
      <Row label="Owner" value={props.owner} />
      <Row label="Treasury Contract" value={props.treasuryContract} />
      <Row label="LayerZero token" value={props.layerZeroToken} />
    </ProtocolComponentCard>
  )
}
