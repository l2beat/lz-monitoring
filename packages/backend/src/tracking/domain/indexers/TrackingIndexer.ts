import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { OAppConfigurationRepository } from '../../../peripherals/database/OAppConfigurationRepository'
import { OAppRepository } from '../../../peripherals/database/OAppRepository'
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
    private readonly oAppRepo: OAppRepository,
    private readonly oAppConfigurationRepo: OAppConfigurationRepository,
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

    await this.oAppRepo.runInTransaction(async (trx) => {
      const oAppsIds = await this.oAppRepo._replaceMany(
        oAppsToBeChecked.map((oapp) => ({
          ...oapp,
          protocolVersion: '1',
          sourceChainId: this.chainId,
        })),
        trx,
      )

      const configurationRecords = await Promise.all(
        oAppsToBeChecked.map(async (oApp, i) => {
          const oAppConfigs = await this.oAppConfigProvider.getConfiguration(
            oApp.address,
          )

          return Object.entries(oAppConfigs).map(([chain, configuration]) => ({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            oAppId: oAppsIds[i]!,
            targetChainId: ChainId(+chain),
            configuration,
          }))
        }),
      )

      this.logger.info(`Replacing V1 oApps tracks`, {
        amount: configurationRecords.length,
      })

      await this.oAppConfigurationRepo._replaceMany(
        configurationRecords.flat(),
        trx,
      )

      await trx.commit()
    })

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
