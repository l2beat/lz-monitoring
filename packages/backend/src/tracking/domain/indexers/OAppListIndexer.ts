import { Logger } from '@l2beat/backend-tools'
import { Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { OAppRepository } from '../../../peripherals/database/OAppRepository'
import { ProtocolVersion } from '../const'
import { OAppListProvider } from '../providers/OAppsListProvider'
import { InMemoryIndexer } from './InMemoryIndexer'

export class OAppListIndexer extends InMemoryIndexer {
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

    await this.oAppRepo.deleteAll()

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
}
