import { ChainId, EthereumAddress } from '@lz/libs'
import { useState } from 'react'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { PaginatedContainer, PaginationControls } from '../PaginatedContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import {
  SafeMultisigTransactionComponent,
  SafeMultisigTransactionSkeleton,
} from '../safe/SafeMultisigTransaction'
import { InlineSkeleton } from '../Skeleton'

interface Props {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
  multisigAddress: EthereumAddress
  chainId: ChainId
}

export function LayerZeroMultisig({
  owners,
  address,
  threshold,
  chainId,
  multisigAddress,
}: Props) {
  const [isLoading, isError, transactions] = useSafeApi({
    chainId,
    multisigAddress,
  })

  const [page, setPage] = useState(1)

  const TXS_PER_PAGE = 10
  const TOTAL_PAGES_AMOUNT = Math.ceil(
    (transactions?.length ?? 0) / TXS_PER_PAGE,
  )
  const LOWER_PAGE_BOUND = TXS_PER_PAGE * (page - 1) + 1
  const UPPER_PAGE_BOUND = Math.min(
    TXS_PER_PAGE * page,
    transactions?.length ?? 0,
  )

  function setNormalizedPage(page: number) {
    if (page > 0 && page <= TOTAL_PAGES_AMOUNT) {
      setPage(page)
    }
  }

  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  const subtitle =
    address ?? 'Protocol on this chain is not owned by Safe Multisig'

  if (isLoading) {
    return (
      <ProtocolComponentCard
        title="LayerZero Multisig"
        subtitle={<InlineSkeleton />}
      >
        <SafeMultisigTransactionSkeleton />
      </ProtocolComponentCard>
    )
  }

  if (isError) {
    return (
      <ProtocolComponentCard
        title="LayerZero Multisig"
        subtitle="Data could not be loaded ⚠️"
      />
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <ProtocolComponentCard
        title="LayerZero Multisig"
        subtitle="No transactions executed"
      />
    )
  }

  return (
    <ProtocolComponentCard
      title="LayerZero Multisig"
      subtitle={subtitle}
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    >
      {hasData && (
        <>
          <Subsection>
            <Row label="Threshold" value={`${threshold}/${owners.length}`} />
            <RowSeparator />
            <Row
              label="Owners"
              value={
                <div className="flex flex-col gap-5 text-xs">
                  {owners.map((owner, i) => (
                    <span key={i}>{owner.toString()}</span>
                  ))}
                </div>
              }
            />
          </Subsection>
          <Subsection>
            <div className="flex items-center justify-between py-3 text-md font-medium">
              <h1>Multisig transactions</h1>
              <PaginationControls
                amountOfPages={TOTAL_PAGES_AMOUNT}
                currentPage={page}
                setPage={setNormalizedPage}
              />
            </div>

            <div className="overflow-x-auto">
              <div className="col-span-5 grid grid-cols-multisig rounded bg-gray-20 py-3 text-left text-[13px] font-semibold text-[#AEAEAE]">
                <div className="px-6">SUBMITTED</div>
                <div>METHOD</div>
                <div>CONFIRMATIONS</div>
                <div>STATUS</div>
                <div />
              </div>
              <PaginatedContainer itemsPerPage={TXS_PER_PAGE} page={page}>
                {transactions.map((tx, i) => (
                  <SafeMultisigTransactionComponent
                    amountOfOwners={owners.length}
                    tx={tx}
                    allTxs={transactions}
                    key={i}
                  />
                ))}
              </PaginatedContainer>
            </div>

            <span className="pb-3 pr-8 pt-5 text-right text-xs text-gray-500">
              {LOWER_PAGE_BOUND} - {UPPER_PAGE_BOUND} out of{' '}
              {transactions.length} transactions
            </span>
          </Subsection>
        </>
      )}
    </ProtocolComponentCard>
  )
}

function Subsection({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col rounded-lg bg-gray-100 px-6 py-2">
      {children}
    </div>
  )
}

function RowSeparator() {
  return <div className="h-px w-full bg-gray-50" />
}
