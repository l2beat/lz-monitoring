import { ChainId, EthereumAddress } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { PaginatedContainer } from './PaginatedContainer'
import {
  SafeMultisigTransactionComponent,
  SafeMultisigTransactionSkeleton,
} from './SafeMultisigTransaction'

interface Props {
  multisigAddress: EthereumAddress
  associatedAddresses: EthereumAddress[]
  chainId: ChainId
}

export function MultisigTransactions(props: Props) {
  const [isLoading, isError, transactions] = useSafeApi(props)

  if (isLoading) {
    return (
      <ComponentLayout>
        <SkeletonTheme baseColor="#0D0D0D" highlightColor="#525252">
          <SafeMultisigTransactionSkeleton />
        </SkeletonTheme>
      </ComponentLayout>
    )
  }

  if (isError) {
    return <ComponentLayout subtitle="Data could not be loaded ⚠️" />
  }

  if (!transactions || transactions.length === 0) {
    return <ComponentLayout subtitle="No transactions executed" />
  }

  return (
    <ComponentLayout>
      <PaginatedContainer itemsPerPage={1}>
        {transactions.map((tx, i) => (
          <SafeMultisigTransactionComponent
            tx={tx}
            key={i}
            associatedAddresses={props.associatedAddresses}
          />
        ))}
      </PaginatedContainer>
    </ComponentLayout>
  )
}

function ComponentLayout({
  children,
  subtitle,
}: {
  children?: React.ReactNode
  subtitle?: string
}) {
  return (
    <section className="mx-6 border-t border-[#3cb1ff] bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-[#3cb1ff]">
          Safe Multisig Transactions
        </h2>
        {subtitle && (
          <span className="font-mono text-gray-600">{subtitle}</span>
        )}
      </div>
      {children}
    </section>
  )
}
