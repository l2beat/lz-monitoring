import { ChainId, DiscoveryApi } from '@lz/libs'
import { useCallback, useEffect, useState } from 'react'

export { useDiscoveryApi }

interface UseDiscoverApiHookOptions {
  initialChainId: ChainId
  apiUrl: string
  intervalMs?: number
}

function useDiscoveryApi({
  initialChainId,
  apiUrl,
  intervalMs = 10_000,
}: UseDiscoverApiHookOptions) {
  const [data, setData] = useState<DiscoveryApi | null>(null)
  const [chainId, setChainId] = useState<ChainId>(initialChainId)

  // Do we need to memoize this with deps?
  const callback = useCallback(async (): Promise<void> => {
    const result = await fetch(apiUrl + 'discovery/' + ChainId.getName(chainId))
    const data = await result.text()
    const parsed = DiscoveryApi.parse(JSON.parse(data))
    setData(parsed)
  }, [apiUrl, chainId])

  useEffect(() => {
    // Refresh on change
    void callback()

    const fetchDataInterval = setInterval(() => {
      void callback()
    }, intervalMs)

    return () => clearInterval(fetchDataInterval)
  }, [chainId, intervalMs, callback])

  return [data, setChainId] as const
}
