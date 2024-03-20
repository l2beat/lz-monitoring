import { Logger } from '@l2beat/backend-tools'
import { Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import {
  OAppDefaultConfigurationRecord,
  OAppDefaultConfigurationRepository,
} from '../../../peripherals/database/OAppDefaultConfigurationRepository'
import { OAppConfigurations } from '../configuration'
import { ProtocolVersion } from '../const'
import { DefaultConfigurationsProvider } from '../providers/DefaultConfigurationsProvider'
import { InMemoryIndexer } from './InMemoryIndexer'

export class DefaultConfigurationIndexer extends InMemoryIndexer {
  constructor(
    logger: Logger,
    private readonly chainId: ChainId,
    private readonly protocolVersion: ProtocolVersion,
    private readonly defaultConfigProvider: DefaultConfigurationsProvider,
    private readonly defaultConfigurationsRepo: OAppDefaultConfigurationRepository,
    parents: Indexer[],
  ) {
    super(logger.tag(ChainId.getName(chainId)), parents)
  }

  protected override async update(_from: number, to: number): Promise<number> {
    const defaultConfig = await this.defaultConfigProvider.getConfigurations()

    if (!defaultConfig) {
      return to
    }

    const records = configToRecords(
      defaultConfig,
      this.protocolVersion,
      this.chainId,
    )

    await this.defaultConfigurationsRepo.addMany(records)

    return to
  }
}

function configToRecords(
  configs: OAppConfigurations,
  protocolVersion: ProtocolVersion,
  sourceChainId: ChainId,
): OAppDefaultConfigurationRecord[] {
  return Object.entries(configs).map(([chain, configuration]) => ({
    protocolVersion,
    sourceChainId,
    targetChainId: ChainId(+chain),
    configuration,
  }))
}
