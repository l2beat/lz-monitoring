import { DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import { ChainHighlight } from './ChainHighlight'
import { Delays } from './Delays'
import { LastDiscoveredBlock } from './LastDiscoveredBlock'
import { LastIndexedBlock } from './LastIndexedBlock'
import { LatestIndexerStates } from './LatestIndexerStates'
import { NodeInformation } from './NodeInformation'
import { StateHighlight } from './StateHighlight'
import {
  capitalizeFirstLetter,
  getOverallHealth,
  healthToBorder,
} from './statusUtils'
import { SubsectionHeader } from './SubsectionHeader'

interface Props {
  status: DiscoveryStatus
}

export function StatusSection(props: Props) {
  const moduleHealth = getOverallHealth(props.status)
  const borderColor = healthToBorder(moduleHealth)

  return (
    <section className={cx('mb-12 border-t bg-gray-900 p-6', borderColor)}>
      {moduleHealth.health === 'unhealthy' && (
        <div className="pb-5">
          {moduleHealth.warnings.map((warning) => (
            <div className="text-[#F5C842]">⚠️ {warning}</div>
          ))}
        </div>
      )}
      <div className="w-100 mb-6 flex justify-between">
        <div className="text-xxl font-medium">
          {capitalizeFirstLetter(props.status.chainName)}
          <ChainHighlight chain={props.status.chainId} />
        </div>
        <StateHighlight state={props.status.state} />
      </div>
      <div>
        <LastIndexedBlock block={props.status.lastIndexedBlock} />
        <LastDiscoveredBlock blockNumber={props.status.lastDiscoveredBlock} />
        <LatestIndexerStates indexerStates={props.status.indexerStates} />
        {props.status.state === 'enabled' ? (
          <Delays delays={props.status.delays} />
        ) : (
          <SubsectionHeader title="Delays" subtitle="Module is offline" />
        )}

        {props.status.state === 'enabled' ? (
          <NodeInformation nodeInfo={props.status.node} />
        ) : (
          <SubsectionHeader
            title="Node information"
            subtitle="Module is offline"
          />
        )}
      </div>
    </section>
  )
}
