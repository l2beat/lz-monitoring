import { ChainId, OAppsResponse } from '@lz/libs'
import { useEffect, useState } from 'react'

import { hasBeenAborted } from './utils'

interface UseTrackingApiHookOptions {
  chainId: ChainId
  apiUrl: string
}

interface TrackingData {
  data: OAppsResponse
  chainId: ChainId
}

export function useTrackingApi({ chainId, apiUrl }: UseTrackingApiHookOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [data, setData] = useState<TrackingData | null>(null)

  useEffect(() => {
    const abortController = new AbortController()

    setIsLoading(true)
    setIsError(false)
    async function fetchData() {
      try {
        const result = await fetch(
          apiUrl + 'tracking/' + ChainId.getName(chainId),
          {
            signal: abortController.signal,
          },
        )

        if (!result.ok) {
          setIsLoading(false)
          setIsError(true)
        }

        const data = await result.text()
        const parsed = OAppsResponse.parse(JSON.parse(data))
        setData({ data: parsed, chainId })
        setIsError(false)
        setIsLoading(false)
      } catch (e) {
        console.error(e)
        if (hasBeenAborted(e)) {
          return
        }
        setIsError(true)
      }
    }

    void fetchData()

    return () => {
      abortController.abort()
    }
  }, [chainId, apiUrl])

  return [data, isLoading, isError] as const
}
