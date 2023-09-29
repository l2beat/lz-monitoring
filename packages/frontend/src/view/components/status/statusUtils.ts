import { DiscoveryStatus } from '@lz/libs'

export type { Health, ModuleHealthStatus }
export { capitalizeFirstLetter, getOverallHealth, healthToBorder }

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

type Health = 'healthy' | 'unhealthy'

type ModuleHealthStatus =
  | {
      health: 'unhealthy'
      warnings: string[]
    }
  | {
      health: 'healthy'
    }

function getOverallHealth(status: DiscoveryStatus): ModuleHealthStatus {
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

  return {
    health: 'healthy',
  }
}

function healthToBorder(health: ModuleHealthStatus) {
  return health.health === 'healthy' ? 'border-[#A3C65B]' : 'border-[#F5C842]'
}
