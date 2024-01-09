import { DiscoveryApi } from '@lz/libs'

import { BlockchainAddress } from '../BlockchainAddress'
import { ChangelogSummary } from '../changelog/ChangelogSummary'
import { Code } from '../Code'
import { ExpandableContainer } from '../ExpandableContainer'
import { InfoTooltip } from '../InfoTooltip'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { Subsection } from '../Subsection'
import { UpdatableBadge, V2Badge } from './Badges'

type Props = {
  isLoading?: boolean
} & DiscoveryApi['contracts']['receiveUln301']

export function ReceiveUln301Contract(props: Props): JSX.Element {
  return (
    <ProtocolComponentCard
      title="Receive ULN 301"
      badge={
        <div className="flex gap-2">
          <UpdatableBadge />
          <V2Badge />
        </div>
      }
      description="ULN 301 Receive for apps"
      subtitle={<BlockchainAddress address={props.address} full />}
      isLoading={props.isLoading}
    >
      <ChangelogSummary address={props.address} />
      <ExpandableContainer
        showText="View contract parameters"
        hideText="Hide contract parameters"
      >
        <Subsection>
          <Row
            label={
              <InfoTooltip text="Owner of the Endpoint Contract">
                Owner
              </InfoTooltip>
            }
            value={
              <BlockchainAddress
                warnOnEoa="Protocol on this chain is owned by an EOA"
                address={props.owner}
              />
            }
          />
          <Row
            label="Default Executor Configurations"
            value={
              <Code className="max-h-[200px]">
                {JSON.stringify(props.defaultExecutors, null, 2)}
              </Code>
            }
          />

          <Row
            label="Default ULN Configurations"
            value={
              <Code className="max-h-[200px]">
                {JSON.stringify(props.defaultUlnConfigs, null, 2)}
              </Code>
            }
          />

          <Row label="Version" value={props.version.join('.')} />
        </Subsection>
      </ExpandableContainer>
    </ProtocolComponentCard>
  )
}
