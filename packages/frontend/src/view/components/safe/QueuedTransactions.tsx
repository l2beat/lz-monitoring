import { ChainId, EthereumAddress } from '@lz/libs'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { PaginatedContainer } from '../page-container/PaginatedContainer'
import { SafeEthereumTransaction } from './transactions/SafeEthereumTransaction'
import { SafeMultisigTransaction } from './transactions/SafeMultisigTransaction'

export { QueuedTransactions }

interface Props {
  multisigAddress: EthereumAddress
  chainId: ChainId
}

function QueuedTransactions(props: Props) {
  const [transactions] = useSafeApi(props)

  return (
    <section className="mx-6 border-t border-blue bg-gray-900 ">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-blue">
          Safe Multisig Transactions
        </h2>

        {!transactions && (
          <span className="font-mono text-gray-600">
            No transactions present within multisig queue
          </span>
        )}
      </div>

      {transactions && (
        <PaginatedContainer itemsPerPage={1}>
          {transactions.map((tx, i) => {
            if (tx.txType === 'MULTISIG_TRANSACTION') {
              return <SafeMultisigTransaction tx={tx} key={i} />
            }

            if (tx.txType === 'ETHEREUM_TRANSACTION') {
              return <SafeEthereumTransaction tx={tx} key={i} />
            }
          })}
        </PaginatedContainer>
      )}
    </section>
  )
}
