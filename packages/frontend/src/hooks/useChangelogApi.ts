import {
  ChainId,
  ChangelogApi,
  ChangelogApiEntry,
  EthereumAddress,
  UnixTime,
} from '@lz/libs'
import { useEffect, useState } from 'react'

import { hasBeenAborted } from './utils'

interface UseChangelogApiHookOptions {
  shouldFetch: boolean
  chainId: ChainId
  address: EthereumAddress
  apiUrl: string
  intervalMs?: number
}

interface ChangelogData {
  perDay: Map<number, ChangelogApiEntry[]> | null
  availableYears: number[] | null
  startTimestamp: UnixTime | null
}

// todo: we can refactor to remove repetitions with useDiscoveryApi
export function useChangelogApi({
  shouldFetch,
  chainId,
  address,
  apiUrl,
}: UseChangelogApiHookOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<ChangelogData>({
    perDay: null,
    availableYears: null,
    startTimestamp: null,
  })

  useEffect(() => {
    if (!shouldFetch) {
      return
    }
    const abortController = new AbortController()
    setIsLoading(true)
    async function fetchData() {
      try {
        const result = await fetch(
          apiUrl +
            'changelog/' +
            ChainId.getName(chainId) +
            '/' +
            address.toString(),
          {
            signal: abortController.signal,
          },
        )

        if (!result.ok) {
          setIsError(true)
        }

        const data = await result.text()
        const parsed = ChangelogApi.parse(JSON.parse(data))

        setData({
          perDay: new Map(
            parsed.perDay.map((x) => [x.timestamp.toNumber(), x.perBlock]),
          ),
          availableYears: parsed.availableYears,
          startTimestamp: parsed.startTimestamp,
        })
        setIsError(false)
      } catch (e) {
        if (hasBeenAborted(e)) {
          return
        }
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()

    return () => {
      abortController.abort()
    }
  }, [shouldFetch, chainId, apiUrl, address])

  return [data, isLoading, isError] as const
}
