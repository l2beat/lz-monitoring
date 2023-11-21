import { ChainId, ChangelogApi, EthereumAddress } from '@lz/libs'
import { useEffect, useState } from 'react'

interface ChangelogData {
  data: ChangelogApi
  chainId: ChainId
  address: EthereumAddress
}

interface UseChangelogApiHookOptions {
  shouldFetch: boolean
  chainId: ChainId
  address: EthereumAddress
  apiUrl: string
  intervalMs?: number
}

// todo: we can refactor to remove repetitions with useDiscoveryApi
export function useChangelogApi({
  shouldFetch,
  chainId,
  address,
  apiUrl,
  intervalMs = 10_000,
}: UseChangelogApiHookOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<ChangelogData | null>(null)

  useEffect(() => {
    if (!shouldFetch) {
      return
    }
    setIsLoading(true)
    async function fetchData() {
      try {
        const result = await fetch(
          apiUrl +
            'changelog/' +
            ChainId.getName(chainId) +
            '/' +
            address.toString(),
        )

        if (!result.ok) {
          setIsError(true)
        }

        const data = await result.text()
        const parsed = ChangelogApi.parse(JSON.parse(data))
        setData({ data: parsed, chainId, address })
        setIsError(false)
      } catch (e) {
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()

    const fetchDataInterval = setInterval(() => {
      void fetchData()
    }, intervalMs)

    return () => clearInterval(fetchDataInterval)
  }, [chainId, intervalMs, apiUrl, address, shouldFetch])

  return [data, isLoading, isError] as const
}
