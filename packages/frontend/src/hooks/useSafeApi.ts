import {
  ChainId,
  createSafeApiClient,
  EthereumAddress,
  SafeTransaction,
} from '@lz/libs'
import { useEffect, useState } from 'react'

export { useSafeApi }

interface UseStatusApiHookOptions {
  chainId: ChainId
  multisigAddress: EthereumAddress
}

function useSafeApi({ chainId, multisigAddress }: UseStatusApiHookOptions) {
  const [transactions, setTransactions] = useState<SafeTransaction[] | null>(
    null,
  )

  useEffect(() => {
    const api = createSafeApiClient(chainId)

    async function fetch() {
      const transactions = await api.getAllTransactions(
        multisigAddress.toString(),
      )

      console.dir({ transactions }, { depth: null })

      setTransactions(transactions.results)
    }
    void fetch()
  }, [chainId, multisigAddress])

  return [transactions] as const
}
