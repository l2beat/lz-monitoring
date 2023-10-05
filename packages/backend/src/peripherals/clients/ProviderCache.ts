import { DiscoveryCache } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { ProviderCacheRepository } from '../database/ProviderCacheRepository'

export class ProviderCache implements DiscoveryCache {
  constructor(
    private readonly repository: ProviderCacheRepository,
    private readonly chainId: ChainId,
  ) {}

  async get(key: string): Promise<string | undefined> {
    const record = await this.repository.findByKeyAndChainId(key, this.chainId)
    return record?.value
  }

  async set(key: string, value: string): Promise<void> {
    await this.repository.addOrUpdate({ key, value, chainId: this.chainId })
  }
}
