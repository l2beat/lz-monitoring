import { assert, Logger } from '@l2beat/backend-tools'
import {
  DiscoveryConfig,
  DiscoveryEngine,
  toDiscoveryOutput,
} from '@l2beat/discovery'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { EventRepository } from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'
import { EventIndexer } from './EventIndexer'

export class DiscoveryIndexer extends ChildIndexer {
  private readonly id = 'DiscoveryIndexer'
  constructor(
    private readonly discoveryEngine: DiscoveryEngine,
    private readonly config: DiscoveryConfig,
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly eventRepository: EventRepository,
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    logger: Logger,
    cacheInvalidationIndexer: CacheInvalidationIndexer,
    eventIndexer: EventIndexer,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [
      cacheInvalidationIndexer,
      eventIndexer,
    ])
  }

  override async start(): Promise<void> {
    const oldConfigHash = (
      await this.indexerStateRepository.findById(this.id, this.chainId)
    )?.configHash
    const newConfigHash = this.config.hash
    if (oldConfigHash !== newConfigHash) {
      await this.setSafeHeight(0)
    }
    await super.start()
  }

  async update(fromTimestamp: number, toTimestamp: number): Promise<number> {
    const [fromBlock, toBlock] = await Promise.all([
      this.blockNumberRepository.findAtOrBefore(
        new UnixTime(fromTimestamp),
        this.chainId,
      ),
      this.blockNumberRepository.findAtOrBefore(
        new UnixTime(toTimestamp),
        this.chainId,
      ),
    ])

    assert(toBlock, 'No block found for toTimestamp')

    const blocksWithEvents = await this.eventRepository.getSortedInRange(
      fromBlock?.blockNumber ?? 0,
      toBlock.blockNumber,
      this.chainId,
    )
    if (blocksWithEvents.length === 0) {
      return toTimestamp
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const firstBlock = blocksWithEvents[0]!
    const updateTo = await this.blockNumberRepository.findByNumber(
      firstBlock.blockNumber,
      this.chainId,
    )
    assert(updateTo, 'No block found for updateTo')
    // we want to mark timestamp as safe and sometimes there is multiple blocks per timestamp (Arbitrum)
    const blocksWithTimestamp = await this.blockNumberRepository.getByTimestamp(
      updateTo.timestamp,
      this.chainId,
    )
    const blocksToUpdate = blocksWithTimestamp.filter((block) =>
      blocksWithEvents.find((x) => x.blockNumber === block.blockNumber),
    )

    await Promise.all(
      blocksToUpdate.map(({ blockNumber }) =>
        this.runAndSaveDiscovery(blockNumber),
      ),
    )

    return updateTo.timestamp.toNumber()
  }

  private async runAndSaveDiscovery(blockNumber: number): Promise<void> {
    const analysis = await this.discoveryEngine.discover(
      this.config,
      blockNumber,
    )

    const discoveryOutput = toDiscoveryOutput(
      this.config.name,
      this.config.chainId,
      this.config.hash,
      blockNumber,
      analysis,
    )

    assert(
      !hasErrors(discoveryOutput),
      'Errors in discovery output ' + errorsToString(discoveryOutput),
    )

    await this.discoveryRepository.add({
      discoveryOutput,
      chainId: this.chainId,
      blockNumber,
    })
    this.logger.info('Discovery finished', { blockNumber })
  }

  override async invalidate(targetHeight: number): Promise<number> {
    const invalidateToBlock = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(targetHeight),
      this.chainId,
    )
    const targetBlockNumber = invalidateToBlock?.blockNumber ?? 0
    await this.discoveryRepository.deleteAfter(targetBlockNumber, this.chainId)
    return invalidateToBlock?.timestamp.toNumber() ?? 0
  }

  async getSafeHeight(): Promise<number> {
    const state = await this.indexerStateRepository.findById(
      this.id,
      this.chainId,
    )

    return state?.height ?? 0
  }

  async setSafeHeight(height: number): Promise<void> {
    await this.indexerStateRepository.addOrUpdate({
      id: this.id,
      height,
      chainId: this.chainId,
      configHash: this.config.hash,
    })
  }
}

function hasErrors(discoveryOutput: DiscoveryOutput): boolean {
  return discoveryOutput.contracts.some((x) => x.errors !== undefined)
}

function errorsToString(discoveryOutput: DiscoveryOutput): string {
  const errors: string[] = []
  for (const contract of discoveryOutput.contracts) {
    if (contract.errors) {
      errors.push(
        `contract: ${contract.name}(${contract.address.toString()}), errors: ` +
          JSON.stringify(contract.errors),
      )
    }
  }

  return errors.join('\n')
}
