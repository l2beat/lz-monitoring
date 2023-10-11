import {
  ChainId,
  createSafeApiClient,
  EthereumAddress,
  SafeMultisigTransaction,
} from '@lz/libs'
import { useEffect, useState } from 'react'

export { useSafeApi }

interface UseStatusApiHookOptions {
  chainId: ChainId
  multisigAddress: EthereumAddress
}

function useSafeApi({ chainId, multisigAddress }: UseStatusApiHookOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [transactions, setTransactions] = useState<
    SafeMultisigTransaction[] | null
  >(null)

  useEffect(() => {
    const api = createSafeApiClient(chainId)

    async function fetch() {
      setIsLoading(true)
      try {
        const transactions = await api.getMultisigTransactions(
          multisigAddress.toString(),
        )

        setTransactions(transactions)
        setIsLoading(false)
      } catch {
        setIsError(true)
      }
      setIsLoading(false)
    }
    void fetch()
  }, [chainId, multisigAddress])

  return [isLoading, isError, transactions] as const
}
