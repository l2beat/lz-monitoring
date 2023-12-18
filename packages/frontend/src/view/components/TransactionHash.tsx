import { getBlockExplorerName, getExplorerTransactionUrl } from '@lz/libs'

import { useChainId } from '../../hooks/chainIdContext'
import { Copyable } from './Copyable'
import { Tooltip } from './Tooltip'

interface Props {
  transactionHash: string
  noStyle?: boolean
}

export function TransactionHash(props: Props) {
  const chainId = useChainId()
  const explorerUrl = getExplorerTransactionUrl(props.transactionHash, chainId)
  const explorerName = getBlockExplorerName(chainId)

  const shortHash = transactionHashEllipsis(props.transactionHash)

  const className = props.noStyle
    ? ''
    : 'inline-block rounded-sm bg-blue-800 px-1 py-0.5 leading-none text-blue-500'

  return (
    <Copyable label="transaction hash" value={props.transactionHash}>
      <span className={className}>
        <Tooltip text={props.transactionHash.toString()} className="md:hidden">
          <a href={explorerUrl} target="_blank" className="underline">
            {shortHash}
          </a>{' '}
        </Tooltip>
        <Tooltip text={'Show on ' + explorerName} className="hidden md:block">
          <a href={explorerUrl} target="_blank" className="underline">
            {shortHash}
          </a>{' '}
        </Tooltip>
      </span>
    </Copyable>
  )
}

function transactionHashEllipsis(tx: string) {
  return tx.slice(0, 5) + '...' + tx.slice(-3)
}
