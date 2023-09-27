import { useEffect, useState } from 'react'

export { useQueryParam }

function useQueryParam(paramName: string) {
  const currentParam = new URLSearchParams(window.location.search).get(
    paramName,
  )

  const [param, setParam] = useState(currentParam)

  useEffect(() => {
    console.dir({ param, paramName })
    const searchParams = new URLSearchParams(window.location.search)

    if (param !== null) {
      searchParams.set(paramName, param)
    }

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${searchParams.toString()}`,
    )
  }, [param, paramName])

  return [param, setParam] as const
}
