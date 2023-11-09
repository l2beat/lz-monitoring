import { ChainId, EthereumAddress, getBlockExplorerUrl } from '@lz/libs'
import { useState } from 'react'

import { CopyIcon } from '../icons/CopyIcon'
import { OkIcon } from '../icons/OkIcon'

export function BlockchainAddress(props: {
  address: EthereumAddress
  chainId: ChainId
}) {
  const [hasCopied, setHasCopied] = useState(false)

  const explorerUrl = getBlockExplorerUrl(props.address, props.chainId)

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
    <>
      <a href={explorerUrl} target="_blank" className="underline">
        {props.address}
      </a>
      <button
        className="ml-2 fill-gray-500 hover:fill-white"
        onClick={() => void copyTextToClipboard(props.address.toString())}
      >
        {hasCopied ? <OkIcon /> : <CopyIcon />}
      </button>
    </>
  )
}
