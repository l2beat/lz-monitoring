import { DiscoveryCache } from '@l2beat/discovery'

import { DiscoveryCacheRepository } from '../database/DiscoveryCacheRepository'

export class InMemoryDiscoveryCache implements DiscoveryCache {
  private readonly cache = new Map<string, string>()

  set(key: string, value: string): Promise<void> {
    console.dir({ msg: 'set', key, value })
    this.cache.set(key, value)
    return Promise.resolve()
  }
  get(key: string): Promise<string | undefined> {
    return Promise.resolve(this.cache.get(key))
  }
}

export class DatabaseDiscoveryCache implements DiscoveryCache {
  constructor(
    private readonly discoveryCacheRepository: DiscoveryCacheRepository,
  ) {}
  async set(key: string, value: string): Promise<void> {
    await this.discoveryCacheRepository.addOrUpdate({ key, value })
  }
  async get(key: string): Promise<string | undefined> {
    const record = await this.discoveryCacheRepository.find(key)

    if (record) {
      return record.value
    }
  }
}
