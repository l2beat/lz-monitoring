import { DefaultExecutorConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from '../../BlockchainAddress'
import { Code } from '../../Code'
import { InfoTooltip } from '../../InfoTooltip'
import { Row } from '../../Row'
import { Block } from './Block'

interface Props {
  config: DefaultExecutorConfigs[keyof DefaultExecutorConfigs]
}

export function DefaultExecutorConfig({ config }: Props) {
  return (
    <Block title="Default executor configuration">
      <Row
        dense
        className="!p-0 md:!pl-7 md:!pr-4"
        label={
          <InfoTooltip text="Maximum message size in bytes one can send.">
            Max message size
          </InfoTooltip>
        }
        value={<Code>{config.maxMessageSize}</Code>}
      />
      <Row
        dense
        className="!p-0 md:!pl-7 md:!pr-4"
        label={
          <InfoTooltip text="Party responsible for dispatching the message to the target chain after it has been signed-off by the security stack.">
            Executor
          </InfoTooltip>
        }
        value={<BlockchainAddress address={EthereumAddress(config.executor)} />}
      />
    </Block>
  )
}
