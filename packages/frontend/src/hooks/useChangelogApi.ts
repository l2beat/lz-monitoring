import {
  ChainId,
  ChangelogApi,
  ChangelogApiEntry,
  EthereumAddress,
} from '@lz/libs'
import { useEffect, useState } from 'react'

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
  })

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

        setData({
          perDay: getChangesPerDay(parsed),
          availableYears: getAvailableYears(parsed),
        })
        setIsError(false)
      } catch (e) {
        console.error(e)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchData()
  }, [chainId, apiUrl, address, shouldFetch])

  return [data, isLoading, isError] as const
}

function getAvailableYears(changes: ChangelogApiEntry[]): number[] {
  // return array of all years from the first year with changes
  // to the current year
  const currentYear = new Date().getUTCFullYear()
  const firstYear = changes[0]?.timestamp.toDate().getUTCFullYear()
  if (!firstYear) {
    return []
  }
  const years = []
  for (let year = currentYear; year >= firstYear; year--) {
    years.push(year)
  }
  return years
}

function getChangesPerDay(
  changes: ChangelogApiEntry[],
): Map<number, ChangelogApiEntry[]> {
  const changelogPerDay = new Map<number, ChangelogApiEntry[]>()
  changes.forEach((change) => {
    const day = change.timestamp.toStartOf('day').toNumber()
    const changes = changelogPerDay.get(day)
    if (!changes) {
      changelogPerDay.set(day, [change])
      return
    }
    changes.push(change)
  })
  return changelogPerDay
}
