import { ChainId, DiscoveryApi } from '@lz/libs'
import { useEffect, useState } from 'react'

import { hasBeenAborted } from './utils'

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
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<DiscoveryData | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    setIsLoading(true)
    setIsError(false)
    async function fetchData() {
      try {
        const result = await fetch(
          apiUrl + 'discovery/' + ChainId.getName(chainId),
          {
            signal: abortController.signal,
          },
        )

        if (!result.ok) {
          setIsLoading(false)
          setIsError(true)
        }

        const data = await result.text()
        const parsed = DiscoveryApi.parse(JSON.parse(data))
        setData({ data: parsed, chainId })
        setIsError(false)
        setIsLoading(false)
      } catch (e) {
        if (hasBeenAborted(e)) {
          return
        }
        setIsError(true)
      }
    }

    void fetchData()

    const fetchDataInterval = setInterval(() => {
      void fetchData()
    }, intervalMs)

    return () => {
      clearInterval(fetchDataInterval)
      abortController.abort()
    }
  }, [chainId, intervalMs, apiUrl])

  return [data, isLoading, isError] as const
}
