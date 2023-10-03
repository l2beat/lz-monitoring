import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { ClockIndexer } from './ClockIndexer'

export class BlockNumberIndexer extends ChildIndexer {
  private lastKnownNumber = 0

  /**
   * Whether to skip reorgs
   * If true, the indexer will not update the database with reorged blocks
   * This is true for now, as we have problems with BlockNumberIndexer lagging behind
   * on Arbitrum and Optimism
   * This changes the behavior of the indexer, as it only downloads the latest block
   * I am keeping this as a temporary solution as we probably want to have support for
   * reorgs in the future, but we need to fix the lagging problem first.
   */
  private readonly skipReorgs: boolean = true

  /**
   * List of reorged blocks
   * Servers as a cross-reference between the consecutive updates
   */
  private reorgedBlocks: BlockNumberRecord[] = []

  /**
   * ID for the indexer
   * Used for state persistency using designated persistent storage
   * @notice Must be unique across all the indexers
   */
  private readonly id = 'BlockNumberIndexer'

  constructor(
    private readonly blockchainClient: BlockchainClient,
    private readonly blockRepository: BlockNumberRepository,
    private readonly indexerRepository: IndexerStateRepository,
    private readonly startBlock: number,
    private readonly chainId: ChainId,
    clockIndexer: ClockIndexer,
    logger: Logger,
    skipReorgs?: boolean,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [clockIndexer])
    this.skipReorgs = skipReorgs ?? this.skipReorgs
  }

  override async start(): Promise<void> {
    await super.start()

    this.lastKnownNumber =
      (await this.blockRepository.findLast(this.chainId))?.blockNumber ??
      this.startBlock
  }

  async update(_fromTimestamp: number, toTimestamp: number): Promise<number> {
    if (this.skipReorgs) {
      const tip = await this.blockchainClient.getBlockNumberAtOrBefore(
        new UnixTime(toTimestamp),
      )
      const block = await this.blockchainClient.getBlock(tip)

      const record = {
        blockNumber: block.number,
        blockHash: block.hash,
        timestamp: new UnixTime(block.timestamp),
        chainId: this.chainId,
      }
      await this.blockRepository.add(record)

      return block.timestamp
    }

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
    await this.blockRepository.deleteAfter(new UnixTime(to), this.chainId)

    return to
  }

  /**
   *
   */
  private async advanceChain(blockNumber: number): Promise<number> {
    let [block, parent] = await Promise.all([
      this.blockchainClient.getBlock(blockNumber),
      this.getKnownBlock(blockNumber - 1),
    ])

    if (block.parentHash !== parent.blockHash) {
      const changed = [block]

      let current = blockNumber
      while (block.parentHash !== parent.blockHash) {
        current--
        ;[block, parent] = await Promise.all([
          this.blockchainClient.getBlock(block.parentHash),
          this.getKnownBlock(current - 1),
        ])
        changed.push(block)
      }

      this.reorgedBlocks = changed.reverse().map((block) => {
        return {
          blockNumber: block.number,
          blockHash: block.hash,
          timestamp: new UnixTime(block.timestamp),
          chainId: this.chainId,
        }
      })

      return parent.timestamp.toNumber()
    }

    const record: BlockNumberRecord = {
      blockNumber: block.number,
      blockHash: block.hash,
      timestamp: new UnixTime(block.timestamp),
      chainId: this.chainId,
    }

    await this.blockRepository.add(record)
    this.lastKnownNumber = block.number

    return block.timestamp
  }

  async setSafeHeight(height: number): Promise<void> {
    await this.indexerRepository.addOrUpdate({
      id: this.id,
      height,
      chainId: this.chainId,
    })
  }

  async getSafeHeight(): Promise<number> {
    const record = await this.indexerRepository.findById(this.id, this.chainId)
    return record?.height ?? 0
  }

  private async getKnownBlock(blockNumber: number): Promise<BlockNumberRecord> {
    const known = await this.blockRepository.findByNumber(
      blockNumber,
      this.chainId,
    )
    if (known) {
      return known
    }
    const downloaded = await this.blockchainClient.getBlock(blockNumber)

    const record: BlockNumberRecord = {
      blockNumber: downloaded.number,
      blockHash: downloaded.hash,
      timestamp: new UnixTime(downloaded.timestamp),
      chainId: this.chainId,
    }
    await this.blockRepository.add(record)

    return record
  }
}
