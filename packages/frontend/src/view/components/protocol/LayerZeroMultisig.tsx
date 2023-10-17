import { EthereumAddress } from '@lz/libs'

import { Code } from '../Code'
import { ProtocolComponentCard } from '../ProtocolComponentCard'
import { Row } from '../Row'
import { InlineSkeleton, MultilineCodeSkeleton } from '../Skeleton'

interface Props {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
  isLoading: boolean
}

export function LayerZeroMultisig({
  owners,
  address,
  threshold,
  isLoading,
}: Props): JSX.Element {
  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  if (isLoading) {
    return (
      <ProtocolComponentCard
        title="Layer Zero Multisig"
        subtitle={<InlineSkeleton />}
        accentColor="blue"
      >
        <Row label="Threshold" value={<InlineSkeleton />} />
        <Row label="Owners" value={<MultilineCodeSkeleton />} />
      </ProtocolComponentCard>
    )
  }

  const subtitle =
    address ?? 'Protocol on this chain is not owned by Safe Multisig'

  return (
    <ProtocolComponentCard
      title="Layer Zero Multisig"
      subtitle={subtitle}
      accentColor="blue"
    >
      {hasData && (
        <>
          <Row label="Threshold" value={`${threshold}/${owners.length}`} />
          <Row
            label="Owners"
            value={<Code>{JSON.stringify(owners, null, 2)}</Code>}
          />
        </>
      )}
    </ProtocolComponentCard>
  )
}
