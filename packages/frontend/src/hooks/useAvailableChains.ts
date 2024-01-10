import { ChainId, ChainModuleConfigsResponse } from '@lz/libs'
import { useEffect, useState } from 'react'

import { config } from '../config'

const hiddenChains = config.features.v2visible ? [] : [ChainId.GOERLI]

interface UseStatusApiHookOptions {
  apiUrl: string
}

export function useAvailableChains({ apiUrl }: UseStatusApiHookOptions) {
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [response, setResponse] = useState<ChainModuleConfigsResponse>([])

  useEffect(() => {
    setIsLoading(true)
    async function fetchData() {
      try {
        const result = await fetch(apiUrl + 'config/chains')
        const data = await result.text()
        const parsed = ChainModuleConfigsResponse.parse(JSON.parse(data))

        setResponse(
          parsed.filter((chain) => !hiddenChains.includes(chain.chainId)),
        )

        setIsError(false)
      } catch (e) {
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [apiUrl])

  return [
    {
      all: response,
      visible: response.filter((c) => c.visible),
      hidden: response.filter((c) => !c.visible),
    },
    isLoading,
    isError,
  ] as const
}
