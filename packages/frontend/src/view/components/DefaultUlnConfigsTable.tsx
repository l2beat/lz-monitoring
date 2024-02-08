import { DefaultUlnConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from './BlockchainAddress'
import { ValueTable } from './ValueTable'

export function DefaultUlnConfigsTable(props: {
  defaultUlnConfigs: DefaultUlnConfigs
}) {
  const rows = Object.entries(props.defaultUlnConfigs).map(([eid, config]) => (
    <div className="col-span-full grid grid-cols-default-uln-configs items-center justify-center border-b border-zinc-650 py-2 text-center text-xs last:border-none">
      <span>{eid}</span>
      <span>{config.confirmations}</span>
      <span>{config.optionalDVNThreshold}</span>
      <span>
        {config.requiredDVNs.map((dvn) => (
          <BlockchainAddress alwaysShort address={EthereumAddress(dvn)} />
        ))}
      </span>
      <span>
        {config.optionalDVNs.length > 0
          ? config.optionalDVNs
          : 'No optional DVNs'}
      </span>
    </div>
  ))

  return (
    <ValueTable
      title="Default ULN Configurations"
      headers={[
        'EID',
        'Confirmations',
        'Optional DVN Threshold',
        'Required DVNs',
        'Optional DVNs',
      ]}
      colsClass="grid-cols-default-uln-configs"
      rows={rows}
    />
  )
}
