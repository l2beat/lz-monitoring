import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { Hash256, UnixTime } from '@lz/libs'

import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ClockIndexer } from './ClockIndexer'

export class BlockNumberIndexer extends ChildIndexer {
  private lastKnownNumber = 0
  private reorgedBlocks = [] as BlockNumberRecord[]
  private readonly id: string

  constructor(
    private readonly blockchainClient: BlockchainClient,
    private readonly blockRepository: BlockNumberRepository,
    private readonly indexerRepository: IndexerStateRepository,
    private readonly startBlock: number,
    clockIndexer: ClockIndexer,
    logger: Logger,
  ) {
    super(logger, [clockIndexer])
    this.id = 'BlockDownloader' // this should be unique across all indexers
  }

  override async start(): Promise<void> {
    await super.start()
    this.lastKnownNumber =
      (await this.blockRepository.findLast())?.blockNumber ?? this.startBlock
  }

  async update(_fromTimestamp: number, toTimestamp: number): Promise<number> {
    if (this.reorgedBlocks.length > 0) {
      // we do not need to check if lastKnown < to because we are sure that
      // those blocks are from the past
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lastKnownNumber = this.reorgedBlocks.at(-1)!.blockNumber
      await this.blockRepository.addMany(this.reorgedBlocks)
      this.reorgedBlocks = []
    }

    const tip = await this.blockchainClient.getBlockNumberAtOrBefore(
      new UnixTime(toTimestamp),
    )
    if (tip <= this.lastKnownNumber) {
      return toTimestamp
    }

    return this.advanceChain(this.lastKnownNumber + 1)
  }

  async invalidate(to: number): Promise<number> {
    await this.blockRepository.deleteAfter(new UnixTime(to))
    return to
  }

  private async advanceChain(blockNumber: number): Promise<number> {
    let [block, parent] = await Promise.all([
      this.blockchainClient.getBlock(blockNumber),
      this.getKnownBlock(blockNumber - 1),
    ])

    if (Hash256(block.parentHash) !== parent.blockHash) {
      const changed = [block]

      let current = blockNumber
      while (Hash256(block.parentHash) !== parent.blockHash) {
        current--
        ;[block, parent] = await Promise.all([
          this.blockchainClient.getBlock(Hash256(block.parentHash)),
          this.getKnownBlock(current - 1),
        ])
        changed.push(block)
      }

      this.reorgedBlocks = changed.reverse().map((block) => {
        return {
          blockNumber: block.number,
          blockHash: Hash256(block.hash),
          timestamp: new UnixTime(block.timestamp),
        }
      })

      return parent.timestamp.toNumber()
    }

    const record: BlockNumberRecord = {
      blockNumber: block.number,
      blockHash: Hash256(block.hash),
      timestamp: new UnixTime(block.timestamp),
    }
    await this.blockRepository.add(record)
    this.lastKnownNumber = block.number

    return block.timestamp
  }

  async setSafeHeight(height: number): Promise<void> {
    await this.indexerRepository.addOrUpdate({ id: this.id, height })
  }

  async getSafeHeight(): Promise<number> {
    const record = await this.indexerRepository.findById(this.id)
    return record?.height ?? 0
  }

  private async getKnownBlock(blockNumber: number): Promise<BlockNumberRecord> {
    const known = await this.blockRepository.findByNumber(blockNumber)
    if (known) {
      return known
    }
    const downloaded = await this.blockchainClient.getBlock(blockNumber)

    const record: BlockNumberRecord = {
      blockNumber: downloaded.number,
      blockHash: Hash256(downloaded.hash),
      timestamp: new UnixTime(downloaded.timestamp),
    }
    await this.blockRepository.add(record)
    return record
  }
}
