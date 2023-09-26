import { Logger } from '@l2beat/backend-tools'
import { RootIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'

export class ClockIndexer extends RootIndexer {
  constructor(
    logger: Logger,
    // Just for pretty logging purposes
    chainId: ChainId,
    private readonly tickInterval: number,
  ) {
    super(logger.tag(ChainId.getName(chainId)))
  }
  override async start(): Promise<void> {
    await super.start()
    setInterval(() => this.requestTick(), this.tickInterval)
  }

  tick(): Promise<number> {
    return Promise.resolve(getTimeSeconds())
  }
}

function getTimeSeconds(): number {
  return Math.floor(Date.now() / 1000)
}
