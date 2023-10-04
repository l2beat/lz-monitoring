import { DiscoveryCache } from '@l2beat/discovery'

export class InMemoryDiscoveryCache implements DiscoveryCache {
  private readonly cache = new Map<string, string>()

  set(key: string, value: string): Promise<void> {
    this.cache.set(key, value)
    return Promise.resolve()
  }
  get(key: string): Promise<string | undefined> {
    return Promise.resolve(this.cache.get(key))
  }
}
