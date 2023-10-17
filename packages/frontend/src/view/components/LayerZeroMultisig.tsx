import { EthereumAddress } from '@lz/libs'
import Skeleton from 'react-loading-skeleton'

import { ProtocolComponentCard } from './ProtocolComponentCard'
import { Code } from './safe/Code'
import { Row } from './ulnv2/Row'

interface Props {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
  isLoading: boolean
}

export function LzMultisig({
  owners,
  address,
  threshold,
  isLoading,
}: Props): JSX.Element {
  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  if (isLoading) {
    const inlineSkeleton = <Skeleton width="350px" />
    const codeSkeleton = (
      <Code>
        <Skeleton count={5} className="my-1" />
      </Code>
    )
    return (
      <ProtocolComponentCard title="LayerZero Multisig" accentColor="blue">
        <Row label="Threshold" value={inlineSkeleton} />
        <Row label="Owners" value={codeSkeleton} />
      </ProtocolComponentCard>
    )
  }

  const subtitle =
    address ?? 'Protocol on this chain is not owned by Safe Multisig'

  return (
    <ProtocolComponentCard
      title="LayerZero Multisig"
      accentColor="blue"
      subtitle={subtitle}
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
