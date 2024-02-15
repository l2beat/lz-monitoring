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
        className="!p-0 md:!pl-7 md:!pr-4"
        label="Max message size"
        value={<Code>{config.maxMessageSize}</Code>}
      />
      <Row
        label="Executor"
        className="!p-0 md:!pl-7 md:!pr-4"
        value={<BlockchainAddress address={EthereumAddress(config.executor)} />}
      />
    </Block>
  )
}
