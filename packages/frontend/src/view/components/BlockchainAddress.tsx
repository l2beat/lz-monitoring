import {
  EthereumAddress,
  getBlockExplorerName,
  getBlockExplorerUrl,
} from '@lz/libs'
import { useState } from 'react'

import { useAddressInfo } from '../../hooks/addressInfoContext'
import { useChainId } from '../../hooks/chainIdContext'
import { CopyIcon } from '../icons/CopyIcon'
import { OkIcon } from '../icons/OkIcon'
import { UnverifiedIcon } from '../icons/UnverifiedIcon'
import { Tooltip } from './Tooltip'

interface Props {
  address: EthereumAddress
  full?: boolean
}

export function BlockchainAddress(props: Props) {
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

  const addressInfo = useAddressInfo(props.address)
  const chainId = useChainId()
  const explorerUrl = getBlockExplorerUrl(props.address, chainId)
  const explorerName = getBlockExplorerName(chainId)

  if (props.address === EthereumAddress.ZERO) {
    return (
      <>
        <span className="sm:hidden">{addressEllipsis(props.address)}</span>
        <span className="hidden sm:inline"> {props.address}</span>
      </>
    )
  }

  return (
    <span className="inline-flex items-center gap-2">
      {addressInfo && !addressInfo.verified && (
        <Tooltip text="Address is not verified">
          <UnverifiedIcon />
        </Tooltip>
      )}

      {addressInfo && !props.full ? (
        <>
          <Tooltip text={props.address.toString()} className="md:hidden">
            <a href={explorerUrl} target="_blank" className="underline">
              {addressEllipsis(props.address)}
            </a>{' '}
          </Tooltip>
          <Tooltip text={'Show on ' + explorerName} className="hidden md:block">
            <a href={explorerUrl} target="_blank" className="underline">
              {props.address.toString()}
            </a>{' '}
          </Tooltip>{' '}
          <span className="whitespace-nowrap text-xs text-zinc-500">
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
            <span className="sm:hidden">{addressEllipsis(props.address)}</span>
            <span className="hidden sm:inline"> {props.address}</span>
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
