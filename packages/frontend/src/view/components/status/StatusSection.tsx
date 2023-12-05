import { ChainId, DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import { FocusLockIcon } from '../../icons/FocusLockIcon'
import { Tooltip } from '../Tooltip'
import { ChainHighlight } from './ChainHighlight'
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

interface Props {
  status: DiscoveryStatus
  focusedChain: ChainId | null
  setFocusedChainId: (chainId: ChainId | null) => void
}

export function StatusSection(props: Props) {
  const moduleHealth = getOverallHealth(props.status)
  const borderColor = healthToBorder(moduleHealth)

  return (
    <section className={cx('mb-12 border-t bg-gray-900 p-6', borderColor)}>
      {moduleHealth.health === 'unhealthy' && (
        <div className="mb-8">
          {moduleHealth.warnings.map((warning, i) => (
            <div key={i} className="my-1 text-[#F5C842]">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}
      <div className="w-100 mb-6 flex justify-between">
        <div className="flex">
          <div className="text-xxl font-medium">
            {capitalizeFirstLetter(props.status.chainName)}
            <ChainHighlight chain={props.status.chainId} />
          </div>
          <Tooltip text="Toggle focus lock on this chain">
            <div
              className="flex h-8 w-8 cursor-pointer items-center justify-center"
              onClick={() =>
                props.setFocusedChainId(
                  props.focusedChain === props.status.chainId
                    ? null
                    : props.status.chainId,
                )
              }
            >
              <FocusLockIcon fill="#FFFFFF" />
            </div>
          </Tooltip>
        </div>
        <StateHighlight
          state={props.status.state}
          visibility={props.status.visible}
        />
      </div>
      <div>
        <LastIndexedBlock status={props.status} />
        <LastDiscoveredBlock status={props.status} />
        <LatestIndexerStates status={props.status} />
        <NodeInformation status={props.status} />
      </div>
    </section>
  )
}
