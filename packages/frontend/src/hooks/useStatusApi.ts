import { DiscoveryStatusResponse } from '@lz/libs'
import { useEffect, useState } from 'react'

interface UseStatusApiHookOptions {
  apiUrl: string
}

export function useStatusApi({ apiUrl }: UseStatusApiHookOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [response, setResponse] = useState<DiscoveryStatusResponse | null>(null)

  async function fetchData() {
    setIsLoading(true)
    try {
      const result = await fetch(apiUrl + 'status/discovery')
      const text = await result.text()
      const parsed = DiscoveryStatusResponse.parse(JSON.parse(text))
      setResponse(parsed)
    } catch (e) {
      console.error(e)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchData()

    const fetchDataInterval = setInterval(() => {
      void fetchData()
    }, 10_000)

    return () => clearInterval(fetchDataInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl])

  return [response, isLoading, isError, fetchData] as const
}
