import { DiscoveryStatus } from '@lz/libs'

export type { Health, HealthWithWarnings }
export { capitalizeFirstLetter, getOverallHealth, healthToBorder }

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

type Health = 'healthy' | 'unhealthy'
interface HealthWithWarnings {
  health: 'unhealthy'
  warnings: string[]
}

type HealthStatus = 'healthy' | HealthWithWarnings

function getOverallHealth(status: DiscoveryStatus): HealthStatus {
  const warnings: string[] = []

  if (status.state === 'disabled') {
    warnings.push('Discovery is disabled')
  }

  if (status.state === 'enabled' && status.delays.discovery > 30) {
    warnings.push('Discovery is lagging behind the tip for more than 30 blocks')
  }

  if (warnings.length > 0) {
    return { health: 'unhealthy', warnings }
  }

  return 'healthy'
}

function healthToBorder(health: HealthStatus) {
  return health === 'healthy' ? 'border-[#A3C65B]' : 'border-[#F5C842]'
}
