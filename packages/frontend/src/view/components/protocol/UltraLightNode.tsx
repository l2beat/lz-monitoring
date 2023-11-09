import { ChainId, EthereumAddress, RemoteChain } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { RemoteChainComponent } from './RemoteChain'

interface Props {
  chainId: ChainId
  address: EthereumAddress
  owner: EthereumAddress
  treasuryContract: EthereumAddress
  layerZeroToken: EthereumAddress
  remoteChains?: RemoteChain[]
}

export function UltraLightNodeContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard
      title="UltraLight Node V2"
      subtitle={
        <BlockchainAddress chainId={props.chainId} address={props.address} />
      }
    >
      <ChangelogSummary chainId={props.chainId} address={props.address} />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <RemoteChainComponent remoteChains={props.remoteChains} />
        </Subsection>
        <Subsection>
          <Row
            label="Owner"
            value={
              <BlockchainAddress
                chainId={props.chainId}
                address={props.owner}
              />
            }
          />
          <Row
            label="Treasury Contract"
            value={
              <BlockchainAddress
                chainId={props.chainId}
                address={props.treasuryContract}
              />
            }
          />

          <Row
            label="LayerZero token"
            value={
              <BlockchainAddress
                chainId={props.chainId}
                address={props.layerZeroToken}
              />
            }
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
