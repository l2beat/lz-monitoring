import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer, Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import {
  OAppConfigurationRecord,
  OAppConfigurationRepository,
} from '../../../peripherals/database/OAppConfigurationRepository'
import { OAppRemoteRepository } from '../../../peripherals/database/OAppRemoteRepository'
import { OAppRepository } from '../../../peripherals/database/OAppRepository'
import { OAppConfigurations } from '../configuration'
import { OAppConfigurationProvider } from '../providers/OAppConfigurationProvider'

export class OAppConfigurationIndexer extends ChildIndexer {
  protected height = 0
  constructor(
    logger: Logger,
    private readonly chainId: ChainId,
    private readonly oAppConfigProvider: OAppConfigurationProvider,
    private readonly oAppRepo: OAppRepository,
    private readonly oAppRemoteRepo: OAppRemoteRepository,
    private readonly oAppConfigurationRepo: OAppConfigurationRepository,
    parents: Indexer[],
  ) {
    super(logger.tag(ChainId.getName(chainId)), parents)
  }

  protected override async update(_from: number, to: number): Promise<number> {
    const oApps = await this.oAppRepo.getBySourceChain(this.chainId)
    const oAppsRemotes = await this.oAppRemoteRepo.findAll()

    const configurationRecords = await Promise.all(
      oApps.map(async (oApp) => {
        const supportedChains = oAppsRemotes
          .filter((remote) => remote.oAppId === oApp.id)
          .map((remote) => remote.targetChainId)

        const oAppConfigs = await this.oAppConfigProvider.getConfiguration(
          oApp.address,
          supportedChains,
        )

        return configToRecord(oAppConfigs, oApp.id)
      }),
    )

    await this.oAppConfigurationRepo.deleteAll()
    await this.oAppConfigurationRepo.addMany(configurationRecords.flat())

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

function configToRecord(
  configs: OAppConfigurations,
  oAppId: number,
): OAppConfigurationRecord[] {
  return Object.entries(configs).map(([chain, configuration]) => ({
    targetChainId: ChainId(+chain),
    configuration,
    oAppId,
  }))
}
