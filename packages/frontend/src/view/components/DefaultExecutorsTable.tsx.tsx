import { DefaultExecutors, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from './BlockchainAddress'
import { decodeDefaultExecutors } from './protocol/utils'
import { ValueTable } from './ValueTable'

export function DefaultExecutorsTable(props: {
  defaultExecutors: DefaultExecutors
}) {
  const rows = Object.entries(
    decodeDefaultExecutors(props.defaultExecutors),
  ).map(([eid, executor]) => (
    <>
      <span>{eid}</span>
      <span>
        <BlockchainAddress address={EthereumAddress(executor)} />
      </span>
    </>
  ))

  return (
    <ValueTable
      title="Default Executors "
      headers={['EID', 'Executor']}
      colsClass="grid-cols-default-executors"
      rows={rows}
    />
  )
}
