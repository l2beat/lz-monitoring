import { assert, Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId, UnixTime } from '@lz/libs'

import { BlockchainClient } from '../peripherals/clients/BlockchainClient'
import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../peripherals/database/BlockNumberRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { LatestBlockNumberIndexer } from './LatestBlockNumberIndexer'

export class BlockNumberIndexer extends ChildIndexer {
  private lastKnownNumber = 0

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
    latestBlockNumberIndexer: LatestBlockNumberIndexer,
    logger: Logger,
  ) {
    super(logger.tag(ChainId.getName(chainId)), [latestBlockNumberIndexer])
  }

  override async start(): Promise<void> {
    await super.start()

    this.lastKnownNumber =
      (await this.blockRepository.findLast(this.chainId))?.blockNumber ??
      this.startBlock
  }

  async update(_fromBlock: number, toBlock: number): Promise<number> {
    if (this.reorgedBlocks.length > 0) {
      // we do not need to check if lastKnown < to because we are sure that
      // those blocks are from the past
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.lastKnownNumber = this.reorgedBlocks.at(-1)!.blockNumber
      await this.blockRepository.addMany(this.reorgedBlocks)
      this.reorgedBlocks = []
    }

    if (this.lastKnownNumber >= toBlock) {
      return toBlock
    }

    return this.advanceChain(toBlock)
  }

  async invalidate(to: number): Promise<number> {
    await this.blockRepository.deleteAfter(to, this.chainId)

    return to
  }

  private async advanceChain(blockNumber: number): Promise<number> {
    const [lastTrueBlock, lastSavedBlock] = await Promise.all([
      this.blockchainClient.getBlock(this.lastKnownNumber),
      this.blockRepository.findLast(this.chainId),
    ])

    if (lastSavedBlock && lastTrueBlock.hash !== lastSavedBlock.blockHash) {
      assert(
        lastTrueBlock.number === lastSavedBlock.blockNumber,
        'lastTrueBlock.number !== lastSavedBlock.blockNumber',
      )
      const changed = []

      let prevTrueBlock = lastTrueBlock
      let prevSavedBlock = lastSavedBlock

      while (prevTrueBlock.hash !== prevSavedBlock.blockHash) {
        changed.push(prevTrueBlock)

        const current = await this.blockRepository.findBlockNumberBefore(
          prevSavedBlock.blockNumber,
          this.chainId,
        )

        if (!current) {
          break
        }

        prevSavedBlock = current
        prevTrueBlock = await this.blockchainClient.getBlock(
          prevSavedBlock.blockNumber,
        )
      }

      this.reorgedBlocks = changed.reverse().map((block) => {
        return {
          blockNumber: block.number,
          blockHash: block.hash,
          timestamp: new UnixTime(block.timestamp),
          chainId: this.chainId,
        }
      })

      return prevSavedBlock.blockNumber
    }

    const newBlock = await this.blockchainClient.getBlock(blockNumber)
    await this.blockRepository.add({
      blockNumber: newBlock.number,
      timestamp: new UnixTime(newBlock.timestamp),
      chainId: this.chainId,
      blockHash: newBlock.hash,
    })
    this.lastKnownNumber = newBlock.number

    return newBlock.number
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
}
