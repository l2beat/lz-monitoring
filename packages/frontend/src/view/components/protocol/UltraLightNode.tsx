import { EthereumAddress, RemoteChain } from '@lz/libs'

import { ExpandableContainer } from '../ExpandableContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { RowSeparator } from '../RowSeparator'
import { Subsection } from '../Subsection'
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
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <RemoteChainComponent remoteChains={props.remoteChains} />
        </Subsection>
        <Subsection>
          <Row label="Owner" value={props.owner} />
          <RowSeparator />
          <Row label="Treasury Contract" value={props.treasuryContract} />
          <RowSeparator />

          <Row label="LayerZero token" value={props.layerZeroToken} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
