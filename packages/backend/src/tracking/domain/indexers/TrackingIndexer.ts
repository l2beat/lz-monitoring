import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import {
  OAppTrackingRecord,
  OAppTrackingRepository,
} from '../../../peripherals/database/OAppTrackingRepository'
import { compareOAppConfigurations } from '../configuration'
import { DefaultConfigurationsProvider } from '../providers/DefaultConfigurationsProvider'
import { OAppConfigurationProvider } from '../providers/OAppConfigurationProvider'
import { OAppListProvider } from '../providers/OAppsListProvider'
import { ClockIndexer } from './ClockIndexer'

export class TrackingIndexer extends ChildIndexer {
  protected height = 0
  constructor(
    logger: Logger,
    private readonly chainId: ChainId,
    private readonly oAppListProvider: OAppListProvider,
    private readonly defaultConfigurationsProvider: DefaultConfigurationsProvider,
    private readonly oAppConfigProvider: OAppConfigurationProvider,
    private readonly oAppTrackingRepo: OAppTrackingRepository,
    clockIndexer: ClockIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [clockIndexer])
  }

  protected override async update(_from: number, to: number): Promise<number> {
    this.logger.info('Tracking update started')
    const oAppsToBeChecked = await this.oAppListProvider.getOApps()
    this.logger.info(`Loaded V1 oApps to be checked`, {
      amount: oAppsToBeChecked.length,
    })

    const defaultConfigurations =
      await this.defaultConfigurationsProvider.getConfigurations()

    assert(
      defaultConfigurations,
      `Could not load default configurations for chain ${ChainId.getName(
        this.chainId,
      )}`,
    )

    const configs = await Promise.all(
      oAppsToBeChecked.map(async (oApp) => ({
        config: await this.oAppConfigProvider.getConfiguration(oApp.address),
        oApp,
      })),
    )

    const records: OAppTrackingRecord[] = configs.flatMap(
      ({ config, oApp }) => {
        if (!config) {
          return []
        }

        const match = compareOAppConfigurations(defaultConfigurations, config)

        return match.map((perChainMatch) => ({
          name: oApp.name,
          address: oApp.address,
          sourceChainId: this.chainId,
          targetChainId: perChainMatch.chainId,
          hasDefaults: perChainMatch.match,
        }))
      },
    )

    this.logger.info(`Replacing V1 oApps tracks`, { amount: records.length })

    await this.oAppTrackingRepo.addMany(records)

    return Promise.resolve(to)
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
