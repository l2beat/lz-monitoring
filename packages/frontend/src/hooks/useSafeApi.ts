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

      // const save = [transactions.at(-24)]

      // setTransactions(transactions.filter((t) => t.transfers.length > 0))
      // console.warn(transactions.map((t) => t.txType))
      setTransactions(transactions)

      console.dir({ save: transactions.filter((t) => t.transfers.length > 0) })
    }
    void fetch()
  }, [chainId, multisigAddress])

  return [transactions] as const
}
