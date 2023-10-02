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

  if (
    status.state === 'enabled' &&
    status.delays &&
    status.delays.discovery > 50
  ) {
    warnings.push(
      `Discovery is lagging behind the tip for more than 50 blocks (${status.delays.discovery} blocks)`,
    )
  }

  if (status.state === 'enabled' && !status.node) {
    warnings.push('Node is not responding')
  }

  if (status.state === 'enabled' && status.indexerStates.length === 0) {
    warnings.push('No indexer reported its status yet')
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
