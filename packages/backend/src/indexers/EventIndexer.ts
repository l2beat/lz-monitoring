import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { EventsToWatchConfig } from '../config/discoveryConfig'
import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import {
  EventRecord,
  EventRepository,
} from '../peripherals/database/EventRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'

export class EventIndexer extends ChildIndexer {
  private readonly id = 'EventIndexer'
  private readonly startBlock: number
  private readonly maxBlockBatchSize: number
  private readonly amtBatches: number

  constructor(
    private readonly blockchainClient: BlockchainClient,
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
    blockNumberIndexer: BlockNumberIndexer,
    logger: Logger,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [blockNumberIndexer])
    this.startBlock = opts.startBlock
    this.amtBatches = opts.amtBatches ?? 1
    this.maxBlockBatchSize = opts.maxBlockBatchSize
  }

  override async update(fromBlock: number, toBlock: number): Promise<number> {
    const fromBlockNumber = fromBlock === 0 ? this.startBlock : fromBlock

    const updateTo = Math.min(
      fromBlockNumber + this.amtBatches * this.maxBlockBatchSize,
      toBlock,
    )

    const blocksToSave: BlockNumberRecord[] = []
    if (updateTo !== toBlock) {
      const updateToBlock = await this.blockchainClient.getBlock(updateTo)
      blocksToSave.push({
        blockNumber: updateTo,
        blockHash: updateToBlock.hash,
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
          return this.blockchainClient.getLogsBatch(
            event.address,
            event.topics,
            from,
            to,
          )
        }),
      ),
    )

    const emitted = logs.flat()
    const blocksWithEvents = emitted
      .map((x) => x.blockNumber)
      // deduplicate array
      .filter((x, i, a) => a.indexOf(x) === i)

    const blocksWithEventsToSave: EventRecord[] = []
    for (const blockNumber of blocksWithEvents) {
      blocksWithEventsToSave.push({
        chainId: this.chainId,
        blockNumber,
      })
      // saving all blocks with events is possibly not necessary
      const savedBlock = await this.blockNumberRepository.findByNumber(
        blockNumber,
        this.chainId,
      )
      if (
        savedBlock ||
        blocksToSave.find((x) => x.blockNumber === blockNumber)
      ) {
        continue
      }
      const blockData = await this.blockchainClient.getBlock(blockNumber)
      blocksToSave.push({
        blockHash: blockData.hash,
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
    const blockNumber = Math.max(targetHeight, this.startBlock)
    await this.eventRepository.deleteAfter(blockNumber, this.chainId)
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
    })
  }
}
