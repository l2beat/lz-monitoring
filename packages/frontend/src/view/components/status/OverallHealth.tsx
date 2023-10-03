import { DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import { getOverallHealth, Health } from './statusUtils'

export function OverallHealth(props: { status: DiscoveryStatus[] }) {
  const systemHealth = getMinimalHealth(props.status)
  const systemHealthTextColor = moduleHealthToColor(systemHealth)
  const systemHealthText = moduleHealthToText(systemHealth)

  return (
    <div>
      <span>System health: </span>
      <span className={cx('font-bold', systemHealthTextColor)}>
        {systemHealthText}
      </span>
    </div>
  )
}

function getMinimalHealth(systemState: DiscoveryStatus[]): Health | null {
  if (systemState.length === 0) {
    return null
  }

  const anyUnhealthy = systemState.some(
    (chainStatus) => getOverallHealth(chainStatus).health === 'unhealthy',
  )

  return anyUnhealthy ? 'unhealthy' : 'healthy'
}

function moduleHealthToColor(health: Health | null): string {
  if (health === 'healthy') {
    return 'text-[#63f542]'
  }
  if (health === 'unhealthy') {
    return 'text-[#f5c842]'
  }

  return 'text-[#b8b8b8]'
}

function moduleHealthToText(health: Health | null): string {
  if (health === 'healthy') {
    return 'healthy 🟢'
  }
  if (health === 'unhealthy') {
    return 'unhealthy ⚠️'
  }

  return 'unknown 🤷‍♂️'
}
