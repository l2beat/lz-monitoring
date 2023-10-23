import { ChainModuleConfigsResponse } from '@lz/libs'
import { useEffect, useState } from 'react'

interface UseStatusApiHookOptions {
  apiUrl: string
}

export function useConfigApi({ apiUrl }: UseStatusApiHookOptions) {
  const [response, setResponse] = useState<ChainModuleConfigsResponse | null>(
    null,
  )

  useEffect(() => {
    async function fetchData() {
      const result = await fetch(apiUrl + 'config/chains')

      const data = await result.text()
      const parsed = ChainModuleConfigsResponse.parse(JSON.parse(data))
      setResponse(parsed)
    }

    void fetchData()
  }, [apiUrl])

  return [response] as const
}
