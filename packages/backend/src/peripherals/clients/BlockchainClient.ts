import { assert, Logger } from '@l2beat/backend-tools'
import { RateLimitedProvider } from '@l2beat/discovery'
import { Bytes, EthereumAddress, Hash256, UnixTime } from '@lz/libs'
import { providers } from 'ethers'

export type BlockFromClient = Pick<providers.Block, 'timestamp' | 'number'> & {
  hash: Hash256
  parentHash: Hash256
}
export class BlockchainClient {
  constructor(
    private readonly provider: RateLimitedProvider,
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this)
  }

  async getBlockNumber(): Promise<number> {
    const result = await this.provider.getBlockNumber()
    return result
  }

  async getBalance(
    holder: EthereumAddress,
    blockTag: BlockTag,
  ): Promise<bigint> {
    const result = await this.provider.getBalance(holder.toString(), blockTag)
    return BigInt(result.toString())
  }

  async getBlockNumberAtOrBefore(
    timestamp: UnixTime,
    start = 0,
  ): Promise<number> {
    const end = await this.getBlockNumber()

    const getBlockTimestamp = async (
      number: number,
    ): Promise<{ timestamp: number }> => {
      const block = await this.getBlock(number)

      return {
        timestamp: block.timestamp,
      }
    }

    return getBlockNumberAtOrBefore(timestamp, start, end, getBlockTimestamp)
  }

  async getBlock(
    blockId: number | Hash256 | 'latest',
  ): Promise<BlockFromClient> {
    const blockTag = typeof blockId === 'number' ? blockId : blockId.toString()
    const block = await this.provider.getBlock(blockTag)
    assert(block, `Block not found for given number: ${blockTag}`)
    assert(block.hash, `Block hash not found for given number: ${blockTag}`)
    return {
      timestamp: block.timestamp,
      number: block.number,
      parentHash: Hash256(block.parentHash),
      hash: Hash256(block.hash),
    }
  }

  async call(parameters: CallParameters, blockTag: BlockTag): Promise<Bytes> {
    const bytes = await this.provider.call(
      {
        from: parameters.from?.toString(),
        to: parameters.to.toString(),
        gasLimit: parameters.gas,
        gasPrice: parameters.gasPrice,
        value: parameters.value,
        data: parameters.data?.toString(),
      },
      blockTag,
    )
    return Bytes.fromHex(bytes)
  }

  /**
   * Handles large block ranges by splitting them into smaller ones when necessary
   */
  async getAllLogs(
    address: EthereumAddress,
    topic: string,
    fromBlock: number,
    toBlock: number,
  ): Promise<providers.Log[]> {
    this.logger.debug('Getting all logs', {
      address: address.toString(),
      topic,
      fromBlock,
      toBlock,
    })

    if (fromBlock === toBlock) {
      return await this.provider.getLogs({
        address: address.toString(),
        topics: [topic],
        fromBlock,
        toBlock,
      })
    }
    try {
      return await this.provider.getLogs({
        address: address.toString(),
        topics: [topic],
        fromBlock,
        toBlock,
      })
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes('Log response size exceeded')
      ) {
        const midPoint = fromBlock + Math.floor((toBlock - fromBlock) / 2)
        const [a, b] = await Promise.all([
          this.getAllLogs(address, topic, fromBlock, midPoint),
          this.getAllLogs(address, topic, midPoint + 1, toBlock),
        ])
        return a.concat(b)
      } else {
        throw e
      }
    }
  }

  async getLogsBatch(
    address: EthereumAddress,
    topics: (string[] | string)[],
    fromBlock: number,
    toBlock: number,
  ): Promise<providers.Log[]> {
    this.logger.debug('Getting logs batch', {
      address: address.toString(),
      topics,
      fromBlock,
      toBlock,
    })

    return this.provider.getLogs({
      address: address.toString(),
      topics,
      fromBlock,
      toBlock,
    })
  }
}

export async function getBlockNumberAtOrBefore(
  timestamp: UnixTime,
  start: number,
  end: number,
  getBlock: (number: number) => Promise<{ timestamp: number }>,
): Promise<number> {
  while (start + 1 < end) {
    const mid = start + Math.floor((end - start) / 2)
    const midBlock = await getBlock(Number(mid))
    const midTimestamp = new UnixTime(midBlock.timestamp)
    if (midTimestamp.lte(timestamp)) {
      start = mid
    } else {
      end = mid
    }
  }

  return start
}

export type BlockTag = number | 'earliest' | 'latest' | 'pending'

export interface CallParameters {
  from?: EthereumAddress
  to: EthereumAddress
  gas?: bigint
  gasPrice?: bigint
  value?: bigint
  data?: Bytes
}
