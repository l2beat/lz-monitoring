import { ChainId, EthereumAddress } from '@lz/libs'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { cardFor } from '../cardFor'
import { PaginatedContainer } from '../PaginatedContainer'
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

const Card = cardFor('Multisig transactions', 'deep-blue')

export function MultisigTransactions(props: Props) {
  const [isLoading, isError, transactions] = useSafeApi(props)

  if (isLoading) {
    return (
      <Card subtitle={<InlineSkeleton />}>
        <SafeMultisigTransactionSkeleton />
      </Card>
    )
  }

  if (isError) {
    return <Card subtitle="Data could not be loaded ⚠️" />
  }

  if (!transactions || transactions.length === 0) {
    return <Card subtitle="No transactions executed" />
  }

  return (
    <Card subtitle={props.multisigAddress}>
      <PaginatedContainer itemsPerPage={1}>
        {transactions.map((tx, i) => (
          <SafeMultisigTransactionComponent
            tx={tx}
            key={i}
            associatedAddresses={props.associatedAddresses}
          />
        ))}
      </PaginatedContainer>
    </Card>
  )
}
