import { ChainId, DiscoveryApi } from '@lz/libs'
import { useEffect, useState } from 'react'

interface DiscoveryData {
  data: DiscoveryApi
  chainId: ChainId
}

interface UseDiscoverApiHookOptions {
  chainId: ChainId
  apiUrl: string
  intervalMs?: number
}

export function useDiscoveryApi({
  chainId,
  apiUrl,
  intervalMs = 10_000,
}: UseDiscoverApiHookOptions) {
  const [shouldFetch, setShouldFetch] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<DiscoveryData | null>(null)

  useEffect(() => {
    setIsLoading(true)
    async function fetchData() {
      try {
        const result = await fetch(
          apiUrl + 'discovery/' + ChainId.getName(chainId),
        )
        const data = await result.text()
        const parsed = DiscoveryApi.parse(JSON.parse(data))
        setData({ data: parsed, chainId })
        setIsError(false)
      } catch (e) {
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (shouldFetch) {
      void fetchData()

      const fetchDataInterval = setInterval(() => {
        void fetchData()
      }, intervalMs)

      return () => clearInterval(fetchDataInterval)
    }
  }, [chainId, intervalMs, apiUrl, shouldFetch])

  return [data, isLoading, isError, setShouldFetch] as const
}
