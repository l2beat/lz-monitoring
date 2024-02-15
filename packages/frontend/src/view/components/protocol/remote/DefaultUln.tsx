import { DefaultUlnConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from '../../BlockchainAddress'
import { Row } from '../../Row'
import { Block } from './Block'

interface Props {
  config: DefaultUlnConfigs[keyof DefaultUlnConfigs]
}

export function DefaultUln({ config }: Props) {
  return (
    <Block title="Default UltraLightNode configuration">
      <Row label="Required confirmations" value={config.confirmations} />
      <Row label="Required DVNs count" value={config.requiredDVNCount} />
      <Row
        label="Required DVNs"
        value={
          config.requiredDVNs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {config.requiredDVNs.map((dvn) => (
                <BlockchainAddress address={EthereumAddress(dvn)} />
              ))}
            </div>
          ) : (
            <span className=" text-gray-400">No required DVNs</span>
          )
        }
      />
      <Row label="Optional DVNs count" value={config.optionalDVNCount} />
      <Row
        label="Optional DVNs threshold"
        value={config.optionalDVNThreshold}
      />
      <Row
        label="Optional DVNs"
        value={
          config.optionalDVNs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {config.optionalDVNs.map((rl) => (
                <BlockchainAddress address={EthereumAddress(rl)} />
              ))}
            </div>
          ) : (
            <span className=" text-gray-100">No optional DVNs</span>
          )
        }
      />
    </Block>
  )
}
