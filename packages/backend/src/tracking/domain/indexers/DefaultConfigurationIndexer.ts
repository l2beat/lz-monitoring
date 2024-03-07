import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer, Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import {
  OAppDefaultConfigurationRecord,
  OAppDefaultConfigurationRepository,
} from '../../../peripherals/database/OAppDefaultConfigurationRepository'
import { OAppConfigurations } from '../configuration'
import { ProtocolVersion } from '../const'
import { DefaultConfigurationsProvider } from '../providers/DefaultConfigurationsProvider'

export class DefaultConfigurationIndexer extends ChildIndexer {
  protected height = 0
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

  public override getSafeHeight(): Promise<number> {
    return Promise.resolve(this.height)
  }

  protected override setSafeHeight(height: number): Promise<void> {
    this.height = height
    return Promise.resolve()
  }

  protected override invalidate(targetHeight: number): Promise<number> {
    return Promise.resolve(targetHeight)
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
