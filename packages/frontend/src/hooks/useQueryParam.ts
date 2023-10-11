import { useEffect, useState } from 'react'

export function useQueryParam(paramName: string) {
  const currentParam = new URLSearchParams(window.location.search).get(
    paramName,
  )

  const [param, setParam] = useState(currentParam)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)

    if (param !== null) {
      searchParams.set(paramName, param)
    }

    // Pretty order
    searchParams.sort()

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${searchParams.toString()}`,
    )
  }, [param, paramName])

  return [param, setParam] as const
}
