import { ChainId, EthereumAddress } from '@lz/libs'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { InlineSkeleton } from '../Skeleton'
import { SafeMultisigTransactionSkeleton } from './SafeMultisigTransaction'

interface Props {
  multisigAddress: EthereumAddress
  associatedAddresses: EthereumAddress[]
  chainId: ChainId
}

export function MultisigTransactions(props: Props) {
  const [isLoading, isError, transactions] = useSafeApi(props)

  if (isLoading) {
    return (
      <ProtocolComponentCard title="txs" subtitle={<InlineSkeleton />}>
        <SafeMultisigTransactionSkeleton />
      </ProtocolComponentCard>
    )
  }

  if (isError) {
    return (
      <ProtocolComponentCard
        title="txs"
        subtitle="Data could not be loaded ⚠️"
      />
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ProtocolComponentCard title="txs" subtitle="No transactions executed" />
    )
  }

  return <ProtocolComponentCard title="txs" subtitle={props.multisigAddress} />
}
