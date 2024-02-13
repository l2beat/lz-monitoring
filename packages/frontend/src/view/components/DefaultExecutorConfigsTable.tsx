import { DefaultExecutorConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from './BlockchainAddress'
import { ValueTable } from './ValueTable'

export function DefaultExecutorConfigsTable(props: {
  defaultExecutorConfigs: DefaultExecutorConfigs
}) {
  const rows = Object.entries(props.defaultExecutorConfigs).map(
    ([eid, config]) => (
      <>
        <span>{eid}</span>
        <span>{config.maxMessageSize}</span>
        <span>
          <BlockchainAddress address={EthereumAddress(config.executor)} />
        </span>
      </>
    ),
  )

  return (
    <ValueTable
      title="Default Executor Configurations"
      headers={['Endpoint ID', 'Max Message Size', 'Executor']}
      colsClass="grid-cols-default-executor-configs"
      rows={rows}
    />
  )
}
