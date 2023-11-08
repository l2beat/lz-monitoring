import { Logger } from '@l2beat/backend-tools'
import { ProviderWithCache } from '@l2beat/discovery'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, Hash256, UnixTime } from '@lz/libs'

import { EventsToWatchConfig } from '../config/discoveryConfig'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import {
  EventRecord,
  EventRepository,
} from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { hashJson } from '../tools/hashJson'
import { CacheInvalidationIndexer } from './CacheInvalidationIndexer'

/**
 * Changing this version will invalidate all existing data.
 * Bump this version when changing the logic of the indexer.
 * Last change: add txHash to EventRecord
 */
const EVENT_INDEXER_LOGIC_VERSION = 1

export class EventIndexer extends ChildIndexer {
  private readonly id = 'EventIndexer'
  private readonly startBlock: number
  private readonly maxBlockBatchSize: number
  private readonly amtBatches: number
  private readonly configHash: Hash256

  constructor(
    private readonly provider: ProviderWithCache,
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly eventRepository: EventRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    private readonly chainId: ChainId,
    private readonly eventsToWatch: EventsToWatchConfig,
    opts: {
      startBlock: number
      maxBlockBatchSize: number
      amtBatches?: number
    },
    cacheInvalidationIndexer: CacheInvalidationIndexer,
    logger: Logger,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [cacheInvalidationIndexer])
    this.startBlock = opts.startBlock
    this.amtBatches = opts.amtBatches ?? 1
    this.maxBlockBatchSize = opts.maxBlockBatchSize
    this.configHash = hashJson(EVENT_INDEXER_LOGIC_VERSION)
  }

  override async start(): Promise<void> {
    const oldConfigHash = (
      await this.indexerStateRepository.findById(this.id, this.chainId)
    )?.configHash
    const newConfigHash = this.configHash

    if (oldConfigHash !== newConfigHash) {
      await this.setSafeHeight(0)
    }

    return super.start()
  }

  override async update(fromBlock: number, toBlock: number): Promise<number> {
    const fromBlockNumber = fromBlock === 0 ? this.startBlock : fromBlock

    const updateTo = Math.min(
      fromBlockNumber + this.amtBatches * this.maxBlockBatchSize,
      toBlock,
    )

    const blocksToSave: BlockNumberRecord[] = []
    if (updateTo !== toBlock) {
      const updateToBlock = await this.provider.getBlock(updateTo)
      blocksToSave.push({
        blockNumber: updateTo,
        blockHash: Hash256(updateToBlock.hash),
        timestamp: new UnixTime(updateToBlock.timestamp),
        chainId: this.chainId,
      })
    }

    const calls = []
    let start = fromBlockNumber
    do {
      const batchTo = Math.min(start + this.maxBlockBatchSize, toBlock)
      calls.push({
        from: start,
        to: batchTo,
      })
      start = batchTo
    } while (start < updateTo)

    const logs = await Promise.all(
      calls.flatMap(({ from, to }) =>
        this.eventsToWatch.map((event) => {
          return this.provider.getLogsBatch(
            event.address,
            event.topics,
            from,
            to,
          )
        }),
      ),
    )

    const emitted = logs.flat()
    const txsWithEvents = emitted
      .map((x) => ({
        blockNumber: x.blockNumber,
        txHash: Hash256(x.transactionHash),
      }))
      // deduplicate array
      .filter(
        (x, i, a) =>
          a.findIndex(
            (y) => x.blockNumber === y.blockNumber && x.txHash === y.txHash,
          ) === i,
      )

    const blocksWithEventsToSave: EventRecord[] = []
    for (const tx of txsWithEvents) {
      blocksWithEventsToSave.push({
        chainId: this.chainId,
        blockNumber: tx.blockNumber,
        txHash: tx.txHash,
      })
      // saving all blocks with events is possibly not necessary
      const savedBlock = await this.blockNumberRepository.findByNumber(
        tx.blockNumber,
        this.chainId,
      )
      if (
        savedBlock ||
        blocksToSave.find((x) => x.blockNumber === tx.blockNumber)
      ) {
        continue
      }
      const blockData = await this.provider.getBlock(tx.blockNumber)
      blocksToSave.push({
        blockHash: Hash256(blockData.hash),
        blockNumber: blockData.number,
        timestamp: new UnixTime(blockData.timestamp),
        chainId: this.chainId,
      })
    }

    if (blocksToSave.length > 0) {
      await this.blockNumberRepository.addMany(blocksToSave)
    }
    if (blocksWithEventsToSave.length > 0) {
      await this.eventRepository.addMany(blocksWithEventsToSave)
    }

    return updateTo
  }

  protected override async invalidate(targetHeight: number): Promise<number> {
    await this.eventRepository.deleteAfter(targetHeight, this.chainId)
    return targetHeight
  }

  override async getSafeHeight(): Promise<number> {
    const indexerState = await this.indexerStateRepository.findById(
      this.id,
      this.chainId,
    )
    return indexerState?.height ?? 0
  }

  override async setSafeHeight(height: number): Promise<void> {
    await this.indexerStateRepository.addOrUpdate({
      id: this.id,
      chainId: this.chainId,
      height,
      configHash: this.configHash,
    })
  }
}
