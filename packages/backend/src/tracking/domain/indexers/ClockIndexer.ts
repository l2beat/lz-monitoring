import { Logger } from '@l2beat/backend-tools'
import { RootIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

export class ClockIndexer extends RootIndexer {
  constructor(
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
    return Promise.resolve(Math.floor(Date.now() / 1000))
  }
}
