import { DefaultExecutorConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from './BlockchainAddress'
import { decodeDefaultExecutorConfigs } from './protocol/utils'
import { ValueTable } from './ValueTable'

export function DefaultExecutorConfigsTable(props: {
  defaultExecutorConfigs: DefaultExecutorConfigs
}) {
  const rows = Object.entries(
    decodeDefaultExecutorConfigs(props.defaultExecutorConfigs),
  ).map(([eid, config]) => (
    <>
      <span>{eid}</span>
      <span>{config.gas}</span>
      <span>
        <BlockchainAddress address={EthereumAddress(config.executor)} />
      </span>
    </>
  ))

  return (
    <ValueTable
      title="Default Executor Configurations"
      headers={['Endpoint ID', 'Gas', 'Executor']}
      colsClass="grid-cols-default-executor-configs"
      rows={rows}
    />
  )
}
