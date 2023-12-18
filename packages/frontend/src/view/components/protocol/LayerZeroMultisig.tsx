import { EthereumAddress } from '@lz/libs'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { useChainId } from '../../../hooks/chainIdContext'
import { useSafeApi } from '../../../hooks/useSafeApi'
import { BlockchainAddress } from '../BlockchainAddress'
import { Info } from '../Info'
import { InfoTooltip } from '../InfoTooltip'
import { PaginatedContainer, PaginationControls } from '../PaginatedContainer'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { SafeMultisigTransaction } from '../safe/SafeMultisigTransaction'
import { deriveMultisigOwnership } from '../safe/utils'
import { Subsection } from '../Subsection'
import { Warning } from '../Warning'
import { GnosisSafeBadge } from './Badges'

interface Props {
  multisigAddress: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
}

export function LayerZeroMultisig({
  owners,
  threshold,
  multisigAddress,
}: Props) {
  const chainId = useChainId()
  const [isSafeLoading, isSafeError, allTransactions] = useSafeApi({
    chainId,
    multisigAddress,
  })

  const [page, setPage] = useState(1)

  const TXS_PER_PAGE = 12
  const TOTAL_PAGES_AMOUNT = Math.ceil(
    (allTransactions?.length ?? 0) / TXS_PER_PAGE,
  )
  const LOWER_PAGE_BOUND = TXS_PER_PAGE * (page - 1) + 1
  const UPPER_PAGE_BOUND = Math.min(
    TXS_PER_PAGE * page,
    allTransactions?.length ?? 0,
  )

  useEffect(() => {
    setPage(1)
  }, [allTransactions])

  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = threshold && owners

  if (isSafeLoading) {
    return (
      <ProtocolComponentCard
        title={<Title />}
        badge={<GnosisSafeBadge />}
        subtitle={<Skeleton width={320} />}
        description={<Skeleton count={2} />}
      >
        <Subsection>
          <Row
            label={<Skeleton width={120} />}
            value={<Skeleton width={320} />}
          />
          <Row
            label={<Skeleton width={120} />}
            value={<Skeleton count={5} className="mt-1 md:mt-3" width={320} />}
          />
        </Subsection>

        <Subsection>
          <div className="flex flex-col items-center justify-between gap-3 py-3 md:flex-row md:gap-0">
            <Skeleton width={120} />
            <Skeleton width={220} />
          </div>

          <Skeleton count={10} height={25} />
        </Subsection>
      </ProtocolComponentCard>
    )
  }

  if (isSafeError) {
    return (
      <ProtocolComponentCard title={<Title />} badge={<GnosisSafeBadge />}>
        <Warning
          title="Error while reaching out to Safe Transaction Service"
          subtitle="Please try again later"
          slim
        />
      </ProtocolComponentCard>
    )
  }

  if (!allTransactions || allTransactions.length === 0 || !hasData) {
    return (
      <ProtocolComponentCard title={<Title />} badge={<GnosisSafeBadge />}>
        <Info
          title="No transactions have been executed"
          subtitle="The multisig contract has no transactions or the data is insufficient"
        />
      </ProtocolComponentCard>
    )
  }

  const derivedOwnershipHistory = deriveMultisigOwnership(
    allTransactions,
    owners.length,
  )

  return (
    <ProtocolComponentCard
      title={<Title />}
      badge={<GnosisSafeBadge />}
      subtitle={<BlockchainAddress address={multisigAddress} full />}
      description="Safe multi-signature contract managed by LayerZero. Owner of the Endpoint and the UltraLightNodeV2 contracts. Any configuration change must be made through the LayerZero multisig wallet. Transaction information is being fetched from the safe transaction service."
    >
      <>
        <Subsection>
          <Row
            label={
              <InfoTooltip text="A required threshold of signatures for a transaction to be executed.">
                Threshold
              </InfoTooltip>
            }
            value={`${threshold}/${owners.length}`}
          />
          <Row
            label={
              <InfoTooltip text="The addresses allowed to sign the messages from the MultiSig contract.">
                Owners
              </InfoTooltip>
            }
            value={
              <div className="flex flex-col items-center gap-1 text-3xs md:items-start md:gap-2 md:text-left md:text-xs">
                {owners.map((owner, i) => (
                  <BlockchainAddress key={i} address={owner} />
                ))}
              </div>
            }
          />
        </Subsection>
        <Subsection>
          <div className="flex flex-col py-3 text-md font-medium">
            <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:gap-0">
              <h1>Multisig transactions</h1>
              <PaginationControls
                amountOfPages={TOTAL_PAGES_AMOUNT}
                currentPage={page}
                setPage={setPage}
              />
            </div>
            <span className="w-full pt-3 text-center text-xs text-gray-100 md:text-right">
              {LOWER_PAGE_BOUND} - {UPPER_PAGE_BOUND} out of{' '}
              {allTransactions.length} transactions
            </span>
          </div>

          <div className="mb-3 overflow-x-auto">
            <div className="col-span-5 grid min-w-[800px] grid-cols-multisig rounded bg-gray-600 py-3 text-left text-[13px] font-semibold text-gray-50">
              <div className="px-6">SUBMITTED</div>
              <div>METHOD</div>
              <div>CONFIRMATIONS</div>
              <div>STATUS</div>
              <div />
            </div>
            <PaginatedContainer itemsPerPage={TXS_PER_PAGE} page={page}>
              {allTransactions.map((transaction, i) => (
                <SafeMultisigTransaction
                  transaction={transaction}
                  allTransactions={allTransactions}
                  derivedOwnershipHistory={derivedOwnershipHistory}
                  key={i}
                />
              ))}
            </PaginatedContainer>
          </div>
        </Subsection>
      </>
    </ProtocolComponentCard>
  )
}

function Title() {
  return (
    <>
      <span className="hidden md:inline">LayerZero </span>Multisig
    </>
  )
}
