import {
  EthereumAddress,
  getBlockExplorerName,
  getExplorerAddressUrl,
} from '@lz/libs'

import { useAddressInfo } from '../../hooks/addressInfoContext'
import { useChainId } from '../../hooks/chainIdContext'
import { UnverifiedIcon } from '../icons/UnverifiedIcon'
import { WarningIcon } from '../icons/WarningIcon'
import { Copyable } from './Copyable'
import { Tooltip } from './Tooltip'

interface Props {
  address: EthereumAddress
  full?: boolean
  warnOnEoa?: string
}

export function BlockchainAddress(props: Props) {
  const addressInfo = useAddressInfo(props.address)
  const chainId = useChainId()
  const explorerUrl = getExplorerAddressUrl(props.address, chainId)
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
    <Copyable label="address" value={props.address.toString()}>
      {addressInfo && !addressInfo.verified && (
        <Tooltip text="Address is not verified">
          <UnverifiedIcon />
        </Tooltip>
      )}

      {addressInfo && addressInfo.name === 'EOA' && props.warnOnEoa && (
        <Tooltip text={props.warnOnEoa}>
          <WarningIcon className="stroke-[#F5C842]" width="13" height="13" />
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
          {addressInfo.name.length > 0 && (
            <span className="whitespace-nowrap text-xs text-zinc-500">
              ({addressInfo.name})
            </span>
          )}
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
    </Copyable>
  )
}

function addressEllipsis(address: EthereumAddress) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
