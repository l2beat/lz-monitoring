import { getBlockExplorerName, getExplorerBlockUrl } from '@lz/libs'

import { useChainId } from '../../hooks/chainIdContext'
import { Copyable } from './Copyable'
import { Tooltip } from './Tooltip'

interface Props {
  blockNumber: number
  noStyle?: boolean
}

export function BlockNumber(props: Props) {
  const chainId = useChainId()
  const explorerUrl = getExplorerBlockUrl(props.blockNumber, chainId)
  const explorerName = getBlockExplorerName(chainId)

  const className = props.noStyle
    ? ''
    : 'inline-block rounded-sm bg-blue-800 px-1 py-0.5 leading-none text-blue-500'

  return (
    <Copyable label="block number" value={props.blockNumber.toString()}>
      <span className={className}>
        <Tooltip text={'Show on ' + explorerName}>
          <a href={explorerUrl} target="_blank" className="underline">
            {props.blockNumber}
          </a>{' '}
        </Tooltip>
      </span>
    </Copyable>
  )
}
