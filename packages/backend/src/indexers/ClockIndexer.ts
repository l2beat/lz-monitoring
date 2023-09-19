import { Logger } from '@l2beat/backend-tools'
import { RootIndexer } from '@l2beat/uif'

export class ClockIndexer extends RootIndexer {
  constructor(
    logger: Logger,
    private readonly tickInterval: number,
  ) {
    super(logger)
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
