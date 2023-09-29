import { DiscoveryStatusResponse } from '@lz/libs'
import { useEffect, useState } from 'react'

export { useStatusApi }

interface UseStatusApiHookOptions {
  apiUrl: string
}

function useStatusApi({ apiUrl }: UseStatusApiHookOptions) {
  const [response, setResponse] = useState<DiscoveryStatusResponse | null>(null)

  useEffect(() => {
    async function fetchData() {
      const result = await fetch(apiUrl + 'status/discovery')

      const data = await result.text()
      const parsed = DiscoveryStatusResponse.parse(JSON.parse(data))
      setResponse(parsed)
    }

    void fetchData()
  }, [apiUrl])

  return [response] as const
}
