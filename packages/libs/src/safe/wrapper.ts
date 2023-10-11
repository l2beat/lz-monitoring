import SafeApiKit, {
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
  ) => Promise<SafeMultisigTransaction[]>
} {
  const chainIdNumber = chainId.valueOf()

  const isSupported = endpoints.isChainSupported(chainIdNumber)

  if (!isSupported) {
    throw new Error(`ChainId ${chainId.valueOf()} is not supported`)
  }

  const safeServiceEndpoint = endpoints.list[chainIdNumber]

  const safeApiKit = new SafeApiKit({
    ethAdapter: spoofedAdapter,
    txServiceUrl: safeServiceEndpoint,
  })

  return {
    getMultisigTransactions: async (multisigAddress: string) => {
      const transactions = []

      let response = await safeApiKit.getAllTransactions(multisigAddress)

      transactions.push(...response.results)

      while (response.next) {
        const raw = await fetch(response.next)

        response = (await raw.json()) as AllTransactionsListResponse

        transactions.push(...response.results)
      }

      return filterMultisigTransactions(transactions)
    },
  }
}

/**
 * Spoof-er adapter mock
 * @notice only internal `getEip3770Address` is being mocked. Original method can ingest EIP-3770 addresses with prefixes returning plain address.
 *
 * Method in question is a part of heavy `@safe-global/protocol-kit` package.
 * Also there are some dependency conflicts. There is no point in getting rid of those since
 * API-kit serves only as a fetch-wrapper.
 */
const spoofedAdapter = {
  getEip3770Address(address: string) {
    return { address }
  },
} as never

function filterMultisigTransactions(
  all: SafeTransaction[],
): SafeMultisigTransaction[] {
  return all.filter(
    (tx) => tx.txType === 'MULTISIG_TRANSACTION',
  ) as SafeMultisigTransaction[]
}
