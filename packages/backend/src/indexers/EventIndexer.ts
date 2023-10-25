import { assert, Logger } from '@l2beat/backend-tools'
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

  constructor(
    private readonly blockchainClient: BlockchainClient,
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly eventRepository: EventRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    // TODO: maybe we don't need that somehow?
    private readonly startBlock: number,
    private readonly maxBlockBatchSize: number,
    private readonly chainId: ChainId,
    private readonly eventsToWatch: EventsToWatchConfig,
    blockNumberIndexer: BlockNumberIndexer,
    logger: Logger,
  ) {
    super(logger, [blockNumberIndexer])
  }

  override async update(from: number, to: number): Promise<number> {
    const fromBlockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(from),
      this.chainId,
    )
    const fromBlockNumber = fromBlockRecord?.blockNumber ?? this.startBlock
    const toBlockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(to),
      this.chainId,
    )
    assert(toBlockRecord, 'toBlockNumber not found')
    const batchTo = Math.min(
      fromBlockNumber + this.maxBlockBatchSize,
      toBlockRecord.blockNumber,
    )
    const blocksToSave: BlockNumberRecord[] = []
    if (batchTo !== toBlockRecord.blockNumber) {
      const batchToBlock = await this.blockchainClient.getBlock(batchTo)
      blocksToSave.push({
        blockNumber: batchTo,
        blockHash: batchToBlock.hash,
        timestamp: new UnixTime(batchToBlock.timestamp),
        chainId: this.chainId,
      })
    }

    const logs = await Promise.all(
      this.eventsToWatch.map((event) => {
        return this.blockchainClient.getLogsBatch(
          event.address,
          event.topics,
          fromBlockNumber,
          batchTo,
        )
      }),
    )

    const emitted = logs.flat()
    const blocksWithEvents = emitted
      .map((x) => x.blockNumber)
      // deduplicate array
      .filter((x, i, a) => a.indexOf(x) === i)

    const eventsToSave: EventRecord[] = []
    for (const blockNumber of blocksWithEvents) {
      eventsToSave.push({
        chainId: this.chainId,
        blockNumber,
      })
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
    if (eventsToSave.length > 0) {
      await this.eventRepository.addMany(eventsToSave)
    }

    const updatedTo =
      blocksToSave
        .find((x) => x.blockNumber === batchTo)
        ?.timestamp.toNumber() ?? to
    return updatedTo
  }

  protected override async invalidate(targetHeight: number): Promise<number> {
    const blockRecord = await this.blockNumberRepository.findAtOrBefore(
      new UnixTime(targetHeight),
      this.chainId,
    )
    const blockNumber = blockRecord?.blockNumber ?? this.startBlock
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
