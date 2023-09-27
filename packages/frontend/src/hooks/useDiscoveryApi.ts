import { ChainId, DiscoveryApi } from '@lz/libs'
import { useEffect, useState } from 'react'

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

  useEffect(() => {
    async function fetchData() {
      const result = await fetch(
        apiUrl + 'discovery/' + ChainId.getName(chainId),
      )
      const data = await result.text()
      const parsed = DiscoveryApi.parse(JSON.parse(data))
      setData(parsed)
    }

    // Refresh on change
    void fetchData()

    const fetchDataInterval = setInterval(() => {
      void fetchData()
    }, intervalMs)

    return () => clearInterval(fetchDataInterval)
  }, [chainId, intervalMs, apiUrl])

  return [data, setChainId] as const
}
