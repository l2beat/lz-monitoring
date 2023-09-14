import { assert, Logger } from '@l2beat/backend-tools'
import {
  Bytes,
  EthereumAddress,
  Hash256,
  RateLimitedProvider,
  UnixTime,
} from '@lz/libs'
import { Block, Log, Provider } from 'ethers'

export type BlockFromClient = Pick<
  Block,
  'timestamp' | 'number' | 'parentHash'
> & { hash: string }
export class BlockchainClient {
  private readonly provider: RateLimitedProvider

  constructor(
    provider: Provider,
    private readonly logger: Logger,
    callsPerMinute = Infinity,
  ) {
    this.logger = this.logger.for(this)
    this.provider = new RateLimitedProvider(provider, callsPerMinute)
  }

  async getBlockNumber(): Promise<number> {
    const result = await this.provider.getBlockNumber()
    return result
  }

  async getBalance(
    holder: EthereumAddress,
    blockTag: BlockTag,
  ): Promise<bigint> {
    return this.provider.getBalance(holder.toString(), blockTag)
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

  async getBlock(blockId: number | Hash256): Promise<BlockFromClient> {
    const block = await this.provider.getBlock(blockId)
    assert(block, `Block not found for given number: ${blockId}`)
    assert(block.hash, `Block hash not found for given number: ${blockId}`)
    return {
      timestamp: block.timestamp,
      number: block.number,
      parentHash: block.parentHash,
      hash: block.hash,
    }
  }

  async call(parameters: CallParameters, blockTag: BlockTag): Promise<Bytes> {
    const bytes = await this.provider.call({
      from: parameters.from?.toString(),
      to: parameters.to.toString(),
      gasLimit: parameters.gas,
      gasPrice: parameters.gasPrice,
      value: parameters.value,
      data: parameters.data?.toString(),
      blockTag,
    })
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
  ): Promise<Log[]> {
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
