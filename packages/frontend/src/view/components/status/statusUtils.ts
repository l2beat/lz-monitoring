import { DiscoveryStatus } from '@lz/libs'

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export type Health = 'healthy' | 'unhealthy'

export type ModuleHealthStatus =
  | {
      health: 'unhealthy'
      warnings: string[]
    }
  | {
      health: 'healthy'
    }

export function getOverallHealth(status: DiscoveryStatus): ModuleHealthStatus {
  const warnings: string[] = []

  if (status.state === 'disabled') {
    warnings.push('Discovery is disabled')
  }

  if (
    status.state === 'enabled' &&
    status.lastDiscoveredBlock &&
    status.node &&
    status.node.blockNumber - status.lastDiscoveredBlock > 50
  ) {
    warnings.push(
      `Discovery is lagging behind the tip for more than 50 blocks (${prettyDigitsGroups(
        status.node.blockNumber - status.lastDiscoveredBlock,
      )} blocks)`,
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

export function healthToBorder(health: ModuleHealthStatus) {
  return health.health === 'healthy' ? 'border-[#A3C65B]' : 'border-[#F5C842]'
}

export function prettyDigitsGroups(num: number, separator = ' '): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}
