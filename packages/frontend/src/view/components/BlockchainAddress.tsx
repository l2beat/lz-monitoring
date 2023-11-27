import {
  ChainId,
  EthereumAddress,
  getBlockExplorerName,
  getBlockExplorerUrl,
} from '@lz/libs'
import { useState } from 'react'

import { CopyIcon } from '../icons/CopyIcon'
import { OkIcon } from '../icons/OkIcon'
import { Tooltip } from './Tooltip'

export function BlockchainAddress(props: {
  address: EthereumAddress
  chainId: ChainId
}) {
  const [hasCopied, setHasCopied] = useState(false)

  const explorerUrl = getBlockExplorerUrl(props.address, props.chainId)
  const explorerName = getBlockExplorerName(props.chainId)
  async function copyTextToClipboard(text: string) {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      document.execCommand('copy', true, text)
    }

    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 500)
  }

  if (props.address === EthereumAddress.ZERO) {
    return props.address.toString()
  }

  return (
    <span className="flex items-center gap-2">
      <Tooltip text={'Show on ' + explorerName}>
        <a
          href={explorerUrl}
          target="_blank"
          className="block font-mono underline"
        >
          {props.address}
        </a>
      </Tooltip>
      <Tooltip text={hasCopied ? 'Copied!' : 'Copy to clipboard'}>
        <button
          className="fill-zinc hover:fill-white"
          onClick={() => void copyTextToClipboard(props.address.toString())}
        >
          {hasCopied ? <OkIcon /> : <CopyIcon />}
        </button>
      </Tooltip>
    </span>
  )
}
