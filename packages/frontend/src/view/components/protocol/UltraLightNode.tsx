import { EthereumAddress, RemoteChain } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { RemoteChainComponent } from './RemoteChain'

interface Props {
  address: EthereumAddress
  owner: EthereumAddress
  treasuryContract: EthereumAddress
  layerZeroToken: EthereumAddress
  remoteChains?: RemoteChain[]
  isLoading?: boolean
}

export function UltraLightNodeContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard
      title="UltraLightNodeV2"
      description="The contract is used as the default messaging library. It handles the message payload packing on the source chain and verification on the destination chain. It stores all the User Application’s configurations."
      subtitle={<BlockchainAddress address={props.address} full />}
      isLoading={props.isLoading}
    >
      <ChangelogSummary address={props.address} showFilters />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row
            label="Owner"
            value={<BlockchainAddress address={props.owner} />}
            hideBorder
          />
          <RemoteChainComponent remoteChains={props.remoteChains} />
          <Row
            label="Treasury Contract"
            value={<BlockchainAddress address={props.treasuryContract} />}
          />

          <Row
            label="LayerZero token"
            value={<BlockchainAddress address={props.layerZeroToken} />}
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
