import { RateLimiter } from '@l2beat/backend-tools'
import { Provider } from 'ethers'

export class RateLimitedProvider {
  private readonly rateLimiter: RateLimiter
  call: Provider['call']
  getBlock: Provider['getBlock']
  getBlockNumber: Provider['getBlockNumber']
  getLogs: Provider['getLogs']
  getBalance: Provider['getBalance']

  constructor(
    private readonly provider: Provider,
    callsPerMinute: number,
  ) {
    this.rateLimiter = new RateLimiter({ callsPerMinute })
    this.call = this.rateLimiter.wrap(this.provider.call.bind(this.provider))
    this.getBlock = this.rateLimiter.wrap(
      this.provider.getBlock.bind(this.provider),
    )
    this.getBlockNumber = this.rateLimiter.wrap(
      this.provider.getBlockNumber.bind(this.provider),
    )
    this.getLogs = this.rateLimiter.wrap(
      this.provider.getLogs.bind(this.provider),
    )
    this.getBalance = this.rateLimiter.wrap(
      this.provider.getBalance.bind(this.provider),
    )
  }
}
