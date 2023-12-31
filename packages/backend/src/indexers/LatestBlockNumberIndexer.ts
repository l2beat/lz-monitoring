import { Logger } from '@l2beat/backend-tools'
import { RootIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

import { BlockchainClient } from '../peripherals/clients/BlockchainClient'

export class LatestBlockNumberIndexer extends RootIndexer {
  constructor(
    private readonly blockchainClient: BlockchainClient,
    logger: Logger,
    private readonly tickInterval: number,
    chainId: ChainId,
  ) {
    super(logger.tag(ChainId.getName(chainId)))
  }
  override async start(): Promise<void> {
    await super.start()
    this.requestTick()
    setInterval(() => this.requestTick(), this.tickInterval)
  }

  async tick(): Promise<number> {
    const block = await this.blockchainClient.getBlock('latest')
    return block.number
  }
}
