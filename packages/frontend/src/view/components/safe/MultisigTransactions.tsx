import { ChainId, EthereumAddress } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { PaginatedContainer } from '../PaginatedContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { InlineSkeleton } from '../Skeleton'
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
      <ProtocolComponentCard
        title="Multisig transactions"
        subtitle={<InlineSkeleton />}
        accentColor="deep-blue"
      >
        <SkeletonTheme baseColor="#0D0D0D" highlightColor="#525252">
          <SafeMultisigTransactionSkeleton />
        </SkeletonTheme>
      </ProtocolComponentCard>
    )
  }

  if (isError) {
    return (
      <ProtocolComponentCard
        title="Multisig transactions"
        subtitle="Data could not be loaded ⚠️"
        accentColor="deep-blue"
      />
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ProtocolComponentCard
        title="Multisig transactions"
        subtitle="No transactions executed"
        accentColor="deep-blue"
      />
    )
  }

  return (
    <ProtocolComponentCard
      title="Multisig transactions"
      subtitle={props.multisigAddress}
      accentColor="deep-blue"
    >
      <PaginatedContainer itemsPerPage={1}>
        {transactions.map((tx, i) => (
          <SafeMultisigTransactionComponent
            tx={tx}
            key={i}
            associatedAddresses={props.associatedAddresses}
          />
        ))}
      </PaginatedContainer>
    </ProtocolComponentCard>
  )
}
