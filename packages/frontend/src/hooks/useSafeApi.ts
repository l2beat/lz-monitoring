import {
  ChainId,
  createSafeApiClient,
  EthereumAddress,
  SafeMultisigTransaction,
} from '@lz/libs'
import { useEffect, useState } from 'react'

import { hasBeenAborted } from './utils'

interface UseStatusApiHookOptions {
  chainId: ChainId
  multisigAddress: EthereumAddress
}

export function useSafeApi({
  chainId,
  multisigAddress,
}: UseStatusApiHookOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [transactions, setTransactions] = useState<
    SafeMultisigTransaction[] | null
  >(null)

  useEffect(() => {
    const api = createSafeApiClient(chainId)
    const abortController = new AbortController()

    async function fetch() {
      setIsLoading(true)
      try {
        const transactions = await api.getMultisigTransactions(
          multisigAddress.toString(),
          abortController.signal,
        )

        setTransactions(transactions)
        setIsLoading(false)
      } catch (e) {
        if (hasBeenAborted(e)) {
          return
        }
        console.error(e)
        setIsError(true)
      }
      setIsLoading(false)
    }

    void fetch()

    return () => {
      abortController.abort()
    }
  }, [chainId, multisigAddress])

  return [isLoading, isError, transactions] as const
}
