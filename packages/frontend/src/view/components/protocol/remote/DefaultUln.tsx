import { DefaultUlnConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from '../../BlockchainAddress'
import { InfoTooltip } from '../../InfoTooltip'
import { Row } from '../../Row'
import { Block } from './Block'

interface Props {
  config: DefaultUlnConfigs[keyof DefaultUlnConfigs]
}

export function DefaultUln({ config }: Props) {
  return (
    <Block title="Default Security Stack configuration">
      <Row
        label={
          <InfoTooltip text="Amount of confirmations required before dispatching a message.">
            Required confirmations
          </InfoTooltip>
        }
        className="!p-0 md:!pl-7 md:!pr-4"
        value={config.confirmations}
      />

      <Row
        label={
          <InfoTooltip text="List of DVN addresses required to sign-off before dispatching a message.">
            Required DVNs
          </InfoTooltip>
        }
        className="!p-0 md:!pl-7 md:!pr-4"
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
      <Row
        label={
          <InfoTooltip text="Amount of optional DVN confirmations required before dispatching a message.">
            Optional DVNs threshold
          </InfoTooltip>
        }
        className="!p-0 md:!pl-7 md:!pr-4"
        value={config.optionalDVNThreshold}
      />
      <Row
        label={
          <InfoTooltip text="List of DVN addresses that can sign-off before dispatching a message.">
            Optional DVNs
          </InfoTooltip>
        }
        className="!p-0 md:!pl-7 md:!pr-4"
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
