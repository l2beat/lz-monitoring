import { getBlockExplorerName, getExplorerBlockUrl } from '@lz/libs'

import { useChainId } from '../../hooks/chainIdContext'
import { Copyable } from './Copyable'
import { Tooltip } from './Tooltip'

interface Props {
  blockNumber: number
  full?: boolean
}

export function BlockNumber(props: Props) {
  const chainId = useChainId()
  const explorerUrl = getExplorerBlockUrl(props.blockNumber, chainId)
  const explorerName = getBlockExplorerName(chainId)

  return (
    <Copyable label="block number" value={props.blockNumber.toString()}>
      <span className="inline-block rounded-sm bg-blue-800 px-1 py-0.5 text-blue-500">
        <Tooltip text={props.blockNumber.toString()} className="md:hidden">
          <a href={explorerUrl} target="_blank" className="underline">
            {props.blockNumber}
          </a>{' '}
        </Tooltip>
        <Tooltip text={'Show on ' + explorerName} className="hidden md:block">
          <a href={explorerUrl} target="_blank" className="underline">
            {props.blockNumber}
          </a>{' '}
        </Tooltip>
      </span>
    </Copyable>
  )
}
