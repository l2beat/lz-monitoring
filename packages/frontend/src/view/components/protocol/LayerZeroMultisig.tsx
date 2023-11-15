import { ChainId, EthereumAddress } from '@lz/libs'
import cx from 'classnames'

import { useSafeApi } from '../../../hooks/useSafeApi'
import { SimpleArrowIcon } from '../../icons/SimpleArrowIcon'
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
  associatedAddresses: EthereumAddress[]
  chainId: ChainId
}

export function LayerZeroMultisig({
  owners,
  address,
  threshold,
  chainId,
  multisigAddress,
  associatedAddresses,
}: Props): JSX.Element {
  const [isLoading, isError, transactions] = useSafeApi({
    chainId,
    multisigAddress,
  })

  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  const subtitle =
    address ?? 'Protocol on this chain is not owned by Safe Multisig'

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
                  {owners.map((owner) => (
                    <span>{owner.toString()}</span>
                  ))}
                </div>
              }
            />
          </Subsection>
          <Subsection>
            <div className="flex items-center justify-between py-3 text-md font-medium">
              <h1>Multisig transactions</h1>
              <PaginationControls
                maxPages={2}
                currentPage={1}
                setPage={() => {}}
              />
            </div>

            <table className="min-w-full table-auto border-collapse border-spacing-3">
              <thead className="bg-gray-20 text-left text-[13px] font-semibold text-[#AEAEAE]">
                <th className="rounded-l py-3 pl-6 font-semibold text-[#AEAEAE]">
                  SUBMITTED
                </th>
                <th className="py-3">METHOD</th>
                <th className="py-3">CONFIRMATIONS</th>
                <th className="py-3">STATUS</th>
                <th className="rounded-r py-3">
                  <></>
                </th>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <SafeMultisigTransactionComponent
                    amountOfOwners={owners.length}
                    tx={tx}
                    key={i}
                    associatedAddresses={associatedAddresses}
                  />
                ))}
              </tbody>
            </table>
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

export function PaginationControls(props: {
  maxPages: number
  currentPage: number
  setPage: (page: number) => void
}) {
  const pageTiles = Array.from({ length: props.maxPages }, (_, i) => (
    <button
      key={i}
      onClick={() => props.setPage(i + 1)}
      className={cx(
        'flex min-h-[30px] min-w-[30px] items-center justify-center rounded hover:bg-gray-50',
        props.currentPage === i + 1 && 'bg-gray-50',
      )}
    >
      {i + 1}
    </button>
  ))

  return (
    <div className="flex items-center gap-3">
      <button className="flex h-[30px] w-[30px] rotate-180 items-center justify-center rounded bg-yellow">
        <SimpleArrowIcon />
      </button>

      {pageTiles}

      <button className="flex h-[30px] w-[30px] items-center justify-center rounded bg-yellow">
        <SimpleArrowIcon />
      </button>
    </div>
  )
}
