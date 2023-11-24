import { Logger } from '@l2beat/backend-tools'
import { RateLimitedProvider } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'
import { providers } from 'ethers'

import { ChainModuleStatus } from '../api/controllers/StatusController'
import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'

export { StatusPoller }

class StatusPoller {
  constructor(
    private readonly chainModuleStatuses: ChainModuleStatus[],
    private readonly indexerRepository: IndexerStateRepository,
    private readonly blockRepository: BlockNumberRepository,
    private readonly logger: Logger,
    private readonly intervalMs: number,
    private readonly maxAcceptableDelayMs: number,
  ) {
    this.logger = logger.for(this)
  }

  async start(): Promise<void> {
    this.logger.info('Polling started', {
      intervalMs: this.intervalMs,
      maxAcceptableDelayMs: this.maxAcceptableDelayMs,
    })

    await this.run()
    setInterval(() => void this.run(), this.intervalMs)
  }

  async run(): Promise<void> {
    this.logger.info('System health check is running')

    const enabledOnly = this.chainModuleStatuses.filter(
      (status) => status.state === 'enabled',
    ) as (ChainModuleStatus & { state: 'enabled' })[]

    const allIndexerStates = await this.indexerRepository.getAll()

    const statusFlags = await Promise.all(
      enabledOnly.map(async (status) => {
        const { chainId } = status
        const chainName = ChainId.getName(chainId)

        this.logger.info(`Running status check for ${chainName}`)

        const tip = await this.getLatestNodeBlock(status.provider)

        if (!tip) {
          this.logger.error(
            `Node did not respond during status check (${chainName})`,
            {
              chainId,
              chainName,
            },
          )

          return false
        }

        const indexerState = allIndexerStates.filter(
          (state) => state.chainId === chainId,
        )

        const indexerWithMaxHeight = indexerState.sort(
          (a, b) => b.height - a.height,
        )[0]

        if (!indexerWithMaxHeight) {
          // indexer might just start so no report here
          return false
        }

        const blockAtMaxHeight = await this.blockRepository.findByNumber(
          indexerWithMaxHeight.height,
          chainId,
        )

        if (!blockAtMaxHeight) {
          this.logger.error('Indexer is at height that has not been indexed', {
            id: indexerWithMaxHeight.id,
            height: indexerWithMaxHeight.height,
            chainId,
            chainName,
          })
          return false
        }

        const timestampOffset =
          tip.timestamp - blockAtMaxHeight.timestamp.toNumber()

        const blockOffset = tip.number - blockAtMaxHeight.blockNumber

        if (timestampOffset > this.maxAcceptableDelayMs) {
          this.logger.error(`Chain is lagging behind too much (${chainName})`, {
            timestampOffset,
            blockOffset,
            chainId,
            chainName,
          })
          return false
        }

        return true
      }),
    )

    const amountOfHealthy = statusFlags.filter(Boolean).length
    const amountOfUnhealthy = statusFlags.length - amountOfHealthy
    const amountOfDisabled =
      this.chainModuleStatuses.length - statusFlags.length

    this.logger.info('System status check has finished', {
      healthy: amountOfHealthy,
      unhealthy: amountOfUnhealthy,
      total: this.chainModuleStatuses.length,
      disabled: amountOfDisabled,
      enabled: enabledOnly.length,
    })
  }

  private async getLatestNodeBlock(
    provider: RateLimitedProvider,
  ): Promise<providers.Block | null> {
    try {
      return await provider.getBlock('latest')
    } catch {
      return null
    }
  }
}
