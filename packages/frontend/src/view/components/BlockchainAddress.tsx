import {
  ChainId,
  EthereumAddress,
  getBlockExplorerName,
  getBlockExplorerUrl,
} from '@lz/libs'
import { useState } from 'react'

import { useAddressInfo } from '../../hooks/addressInfoContext'
import { CopyIcon } from '../icons/CopyIcon'
import { OkIcon } from '../icons/OkIcon'
import { UnverifiedIcon } from '../icons/UnverifiedIcon'
import { Tooltip } from './Tooltip'

export function BlockchainAddress(props: {
  address: EthereumAddress
  chainId: ChainId
  full?: boolean
}) {
  const addressInfo = useAddressInfo(props.address)
  const explorerUrl = getBlockExplorerUrl(props.address, props.chainId)
  const explorerName = getBlockExplorerName(props.chainId)

  const [hasCopied, setHasCopied] = useState(false)
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
      {addressInfo && !addressInfo.verified && (
        <Tooltip text="Address is not verified">
          <UnverifiedIcon />
        </Tooltip>
      )}

      {addressInfo && !props.full ? (
        <>
          <Tooltip text={props.address.toString()}>
            <a href={explorerUrl} target="_blank" className="underline">
              {addressEllipsis(props.address)}
            </a>{' '}
          </Tooltip>{' '}
          <span className="text-xs text-zinc-500 no-underline">
            ({addressInfo.name})
          </span>
        </>
      ) : (
        <Tooltip text={'Show on ' + explorerName}>
          <a
            href={explorerUrl}
            target="_blank"
            className="block whitespace-nowrap font-mono underline"
          >
            {props.address}
          </a>
        </Tooltip>
      )}
      <Tooltip text={hasCopied ? 'Copied!' : 'Copy address to clipboard'}>
        <button
          className="fill-zinc-500 hover:fill-white"
          onClick={() => void copyTextToClipboard(props.address.toString())}
        >
          {hasCopied ? <OkIcon /> : <CopyIcon />}
        </button>
      </Tooltip>
    </span>
  )
}

function addressEllipsis(address: EthereumAddress) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
