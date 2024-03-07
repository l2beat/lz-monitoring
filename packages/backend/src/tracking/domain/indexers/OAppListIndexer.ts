import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer, Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { OAppRepository } from '../../../peripherals/database/OAppRepository'
import { ProtocolVersion } from '../const'
import { OAppListProvider } from '../providers/OAppsListProvider'

export class OAppListIndexer extends ChildIndexer {
  protected height = 0
  constructor(
    logger: Logger,
    private readonly chainId: ChainId,
    private readonly oAppListProvider: OAppListProvider,
    private readonly oAppRepo: OAppRepository,
    parents: Indexer[],
  ) {
    super(logger.tag(ChainId.getName(chainId)), parents)
  }

  protected override async update(_from: number, to: number): Promise<number> {
    const oApps = await this.oAppListProvider.getOApps()

    this.logger.info(`Loaded V1 oApps to be checked`, {
      amount: oApps.length,
    })

    await this.oAppRepo.addMany(
      oApps.map((oApp) => ({
        ...oApp,
        iconUrl: oApp.iconUrl ?? undefined,
        protocolVersion: ProtocolVersion.V1,
        sourceChainId: this.chainId,
      })),
    )

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
