import { EthereumAddress } from '@lz/libs'

import { cardFor } from '../cardFor'
import { Code } from '../Code'
import { Row } from '../Row'

interface Props {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
}

const Card = cardFor('Layer Zero Multisig', 'blue')

export function LayerZeroMultisig({
  owners,
  address,
  threshold,
}: Props): JSX.Element {
  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  const subtitle =
    address ?? 'Protocol on this chain is not owned by Safe Multisig'

  return (
    <Card subtitle={subtitle}>
      {hasData && (
        <>
          <Row label="Threshold" value={`${threshold}/${owners.length}`} />
          <Row
            label="Owners"
            value={<Code>{JSON.stringify(owners, null, 2)}</Code>}
          />
        </>
      )}
    </Card>
  )
}
