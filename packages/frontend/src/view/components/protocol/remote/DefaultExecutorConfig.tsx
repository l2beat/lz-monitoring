import { DefaultExecutorConfigs, EthereumAddress } from '@lz/libs'

import { BlockchainAddress } from '../../BlockchainAddress'
import { Code } from '../../Code'
import { Row } from '../../Row'
import { Block } from './Block'

interface Props {
  config: DefaultExecutorConfigs[keyof DefaultExecutorConfigs]
}

export function DefaultExecutorConfig({ config }: Props) {
  return (
    <Block title="Default executor configuration">
      <Row
        label="Max message size"
        value={<Code>{config.maxMessageSize}</Code>}
      />
      <Row
        label="Executor"
        value={<BlockchainAddress address={EthereumAddress(config.executor)} />}
      />
    </Block>
  )
}
