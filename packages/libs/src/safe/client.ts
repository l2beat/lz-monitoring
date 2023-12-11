import {
  AllTransactionsListResponse,
  SafeMultisigTransactionWithTransfersResponse,
} from '@safe-global/api-kit'

import { ChainId } from '../chainId'
import { endpoints } from './endpoints'

export { createSafeApiClient }
export type { SafeMultisigTransaction }

type ArrayItem<T extends unknown[]> = T extends (infer U)[] ? U : never
type SafeMultisigTransaction = SafeMultisigTransactionWithTransfersResponse
type SafeTransaction = ArrayItem<AllTransactionsListResponse['results']>

function createSafeApiClient(chainId: ChainId): {
  getMultisigTransactions: (
    multisigAddress: string,
    signal?: AbortSignal,
  ) => Promise<SafeMultisigTransaction[]>
} {
  const chainIdNumber = chainId.valueOf()

  const isSupported = endpoints.isChainSupported(chainIdNumber)

  if (!isSupported) {
    throw new Error(`ChainId ${chainId.valueOf()} is not supported`)
  }

  const safeServiceEndpoint = endpoints.list[chainIdNumber]

  return {
    getMultisigTransactions: async (multisigAddress, signal) => {
      const transactions: SafeTransaction[] = []

      const callEndpoint = `${safeServiceEndpoint}/api/v1/safes/${multisigAddress}/all-transactions/`

      // Batch of 10s since the API will force-paginate despite params
      const initialParams = new URLSearchParams({
        limit: '10',
      })

      const response = await fetch(
        `${callEndpoint}?${initialParams.toString()}`,
        { signal },
      )
      let json = (await response.json()) as AllTransactionsListResponse

      transactions.push(...json.results)

      while (json.next) {
        const raw = await fetch(json.next, { signal })

        json = (await raw.json()) as AllTransactionsListResponse

        transactions.push(...json.results)
      }

      return filterMultisigTransactions(transactions)
    },
  }
}

function filterMultisigTransactions(
  all: SafeTransaction[],
): SafeMultisigTransaction[] {
  return all.filter(
    (tx) => tx.txType === 'MULTISIG_TRANSACTION',
  ) as SafeMultisigTransaction[]
}
