import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer, Indexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import {
  OAppRemoteRecord,
  OAppRemoteRepository,
} from '../../../peripherals/database/OAppRemoteRepository'
import { OAppRepository } from '../../../peripherals/database/OAppRepository'
import { OAppRemotesProvider } from '../providers/OAppRemotesProvider'

export class OAppRemoteIndexer extends ChildIndexer {
  protected height = 0
  constructor(
    logger: Logger,
    private readonly chainId: ChainId,
    private readonly oAppRepo: OAppRepository,
    private readonly oAppRemotesRepo: OAppRemoteRepository,
    private readonly oAppRemoteProvider: OAppRemotesProvider,
    parents: Indexer[],
  ) {
    super(logger.tag(ChainId.getName(chainId)), parents)
  }

  protected override async update(_from: number, to: number): Promise<number> {
    const oApps = await this.oAppRepo.getBySourceChain(this.chainId)

    const records: OAppRemoteRecord[][] = await Promise.all(
      oApps.map(async (oApp) => {
        const supportedRemoteChains =
          await this.oAppRemoteProvider.getSupportedRemotes(oApp.address)

        return supportedRemoteChains.map((chainId) => ({
          oAppId: oApp.id,
          targetChainId: chainId,
        }))
      }),
    )

    await this.oAppRemotesRepo.deleteAll()
    await this.oAppRemotesRepo.addMany(records.flat())

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
