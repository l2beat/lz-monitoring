import { Logger } from '@l2beat/backend-tools'
import { ChainId, EndpointID } from '@lz/libs'

import {
  getContractByName,
  getContractValue,
} from '../../../api/controllers/discovery/utils'
import { LZ_CONTRACTS_NAMES } from '../../../config/constants'
import { CurrentDiscoveryRepository } from '../../../peripherals/database/CurrentDiscoveryRepository'
import { OAppConfigurations } from '../configuration'

export type { DefaultConfigurationsProvider }
export { DiscoveryDefaultConfigurationsProvider }

type RawDefaultConfigurations = Record<
  number,
  Partial<Record<string, number | string>>
>

/**
 * Provides the default configuration on given chain
 */
interface DefaultConfigurationsProvider {
  getConfigurations(): Promise<OAppConfigurations | null>
}

class DiscoveryDefaultConfigurationsProvider
  implements DefaultConfigurationsProvider
{
  constructor(
    private readonly currDiscoveryRepo: CurrentDiscoveryRepository,
    private readonly chainId: ChainId,
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this).tag(ChainId.getName(chainId))
  }

  async getConfigurations(): Promise<OAppConfigurations | null> {
    const latestDiscovery = await this.currDiscoveryRepo.find(this.chainId)

    if (!latestDiscovery) {
      this.logger.error(
        `No discovery found for chain ${ChainId.getName(this.chainId)}`,
      )
      return null
    }

    const ulnV2 = getContractByName(
      LZ_CONTRACTS_NAMES.V1.ULTRA_LIGHT_NODE_V2,
      latestDiscovery.discoveryOutput,
    )

    const defaultAppConfig = getContractValue<RawDefaultConfigurations>(
      ulnV2,
      'defaultAppConfig',
    )

    return this.remapEndpointIds(defaultAppConfig)
  }

  /**
   * Remap endpoint ids to chain ids and strip unsupported chains
   */
  private remapEndpointIds(
    raw: RawDefaultConfigurations,
  ): OAppConfigurations | null {
    const supportedChainIds = ChainId.getAll()

    const mapped = Object.entries(raw).flatMap(([endpointId, config]) => {
      const chainId = EndpointID.decodeV1(endpointId)

      // Flat map
      if (!chainId || !supportedChainIds.includes(chainId)) {
        return []
      }

      return [[chainId.valueOf(), config]] as const
    })

    if (mapped.length !== supportedChainIds.length) {
      this.logger.error(
        `Not all chains have been remapped from EID. Expected ${supportedChainIds.length}, got ${mapped.length}`,
      )
      return null
    }

    return Object.fromEntries(mapped) as unknown as OAppConfigurations
  }
}
