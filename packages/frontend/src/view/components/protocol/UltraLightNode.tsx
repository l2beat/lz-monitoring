import { EthereumAddress, RemoteChain } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { ExpandableContainer } from '../ExpandableContainer'
import { InfoTooltip } from '../InfoTooltip'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { UpdatableBadge } from './Badges'
import { RemoteChainComponent } from './remote/RemoteChain'

interface Props {
  address: EthereumAddress
  owner: EthereumAddress
  treasuryContract: EthereumAddress
  layerZeroToken: EthereumAddress
  remoteChains: RemoteChain[]
  isLoading?: boolean
}

export function UltraLightNodeContract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard
      title="UltraLightNodeV2"
      badge={<UpdatableBadge />}
      description="The contract is used as the default messaging library. It handles the message payload packing on the source chain and verification on the destination chain. It stores all the User Application’s configurations."
      subtitle={<BlockchainAddress address={props.address} full />}
      isLoading={props.isLoading}
    >
      <ChangelogSummary address={props.address} showFilters groupedEntries />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row
            label={
              <InfoTooltip text="The owner of the contract. Allowed to change the following values: the destination UltraLightNodeV2 library, the enabled outbound proof types, the available proof libraries, the default adapter parameters, the default app config, the Treasury contract address, and the LayerZero token. Allowed to withdraw fees from the Treasury contract.">
                Owner
              </InfoTooltip>
            }
            value={
              <BlockchainAddress
                warnOnEoa="Protocol component on this chain is owned by an EOA"
                address={props.owner}
              />
            }
            hideBorder
          />
          <RemoteChainComponent remoteChains={props.remoteChains} />
          <Row
            label={
              <InfoTooltip text="The contract where all the fees are received. The owner of UltraLightNodeV2 can set a new treasury address and withdraw ZRO and native gas tokens from the treasury.">
                Treasury Contract
              </InfoTooltip>
            }
            value={<BlockchainAddress address={props.treasuryContract} />}
          />

          <Row
            label={
              <InfoTooltip text="The fee token, if set. Can be used as an alternative payment for protocol fees. The owner of UltraLightNodeV2 can set a new ZRO token.">
                LayerZero token
              </InfoTooltip>
            }
            value={<BlockchainAddress address={props.layerZeroToken} />}
          />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
