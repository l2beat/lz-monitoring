import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { DefaultConfigurationsProvider } from '../providers/DefaultConfigurationsProvider'
import { OAppConfigurationProvider } from '../providers/OAppConfigurationProvider'
import { OAppListProvider } from '../providers/OAppsListProvider'
import { ClockIndexer } from './ClockIndexer'

export class TrackingIndexer extends ChildIndexer {
  protected height = 0
  constructor(
    logger: Logger,
    chainId: ChainId,
    private readonly oAppListProvider: OAppListProvider,
    private readonly defaultConfigurationsProvider: DefaultConfigurationsProvider,
    private readonly oAppConfigProvider: OAppConfigurationProvider,
    clockIndexer: ClockIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [clockIndexer])
  }

  protected override invalidate(targetHeight: number): Promise<number> {
    this.height = targetHeight
    // NOOP
    return Promise.resolve(targetHeight)
  }

  protected override async update(from: number, to: number): Promise<number> {
    const oapps = await this.oAppListProvider.getOApps()
    const defaultConfigurations =
      await this.defaultConfigurationsProvider.getConfigurations()

    const configs = await Promise.all(
      oapps.map(async (oapp) => ({
        config: await this.oAppConfigProvider.getConfiguration(oapp.address),
        oapp,
      })),
    )

    console.dir(configs, { depth: null })
    return Promise.resolve(to)
  }

  override getSafeHeight(): Promise<number> {
    return Promise.resolve(this.height)
  }

  override setSafeHeight(height: number): Promise<void> {
    this.height = height
    return Promise.resolve()
  }
}
