import { DiscoveryCache } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { ProviderCacheRepository } from '../database/ProviderCacheRepository'

export class ProviderCache implements DiscoveryCache {
  constructor(private readonly repository: ProviderCacheRepository) {}

  async get(key: string): Promise<string | undefined> {
    const record = await this.repository.findByKey(key)
    return record?.value
  }

  async set(
    key: string,
    value: string,
    chainId: number,
    blockNumber: number | undefined,
  ): Promise<void> {
    await this.repository.addOrUpdate({
      key,
      value,
      chainId: ChainId(chainId),
      blockNumber: blockNumber ?? null,
    })
  }
}
