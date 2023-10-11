import {
  CommonTransfer,
  ERC20Transfer,
  EthereumAddress,
  EtherTransfer,
} from '@lz/libs'
import { TransferWithTokenInfoResponse } from '@safe-global/api-kit'

import { Row } from '../Row'
import { toUTC } from '../utils'
import { Badge, BadgeVariant } from './Badge'

export { TokenTransfers }

function TokenTransfers({
  transfers,
  associatedAddresses,
}: {
  transfers: TransferWithTokenInfoResponse[]
  associatedAddresses: EthereumAddress[]
}) {
  return transfers.map((transfer, i) => {
    return (
      <div key={i} className="border-y border-[#99f00d] pb-4 pl-5">
        <div className="p-5 font-mono text-lg text-gray-500">#{i + 1}</div>
        <div className="pl-6">
          {isEtherTransfer(transfer) && (
            <EtherTransferComponent
              transfer={transfer}
              associatedAddresses={associatedAddresses}
            />
          )}
          {isErc20Transfer(transfer) && (
            <ERC20TransferComponent
              transfer={transfer}
              associatedAddresses={associatedAddresses}
            />
          )}
        </div>
      </div>
    )
  })
}

function CommonTransferComponent({
  transfer,
  associatedAddresses,
}: {
  transfer: CommonTransfer
  associatedAddresses: EthereumAddress[]
}) {
  const isOutgoing = associatedAddresses.includes(
    EthereumAddress(transfer.from),
  )
  const isIncoming = associatedAddresses.includes(EthereumAddress(transfer.to))
  const isSelf = isOutgoing && isIncoming

  const transferDirection = isSelf
    ? 'Internal'
    : isOutgoing
    ? 'Outgoing'
    : 'Incoming'

  const badgeVariant: BadgeVariant = isSelf
    ? 'grey'
    : isOutgoing
    ? 'yellow'
    : 'green'

  return (
    <div>
      <Row label="Block number" value={transfer.blockNumber} />
      <Row
        label="Transaction hash"
        value={transfer.transactionHash ?? 'Not yet executed'}
      />
      <Row
        label="Execution date"
        value={
          transfer.executionDate
            ? toUTC(transfer.executionDate)
            : 'Not yet executed'
        }
      />
      <Row label="From" value={transfer.from} />
      <Row label="To" value={transfer.to} />
      {associatedAddresses.length > 0 && (
        <Row
          label="Direction"
          value={<Badge variant={badgeVariant}>{transferDirection}</Badge>}
        />
      )}
    </div>
  )
}

function EtherTransferComponent({
  transfer,
  associatedAddresses,
}: {
  transfer: EtherTransfer
  associatedAddresses: EthereumAddress[]
}) {
  return (
    <div>
      <Row label="Type" value="Native coin transfer" />
      <CommonTransferComponent
        transfer={transfer}
        associatedAddresses={associatedAddresses}
      />
      <Row label="Amount" value={toFullAmount(transfer.value, 18)} />
    </div>
  )
}

function ERC20TransferComponent({
  transfer,
  associatedAddresses,
}: {
  transfer: ERC20Transfer
  associatedAddresses: EthereumAddress[]
}) {
  return (
    <div>
      <Row label="Type" value="ERC20 transfer" />
      <CommonTransferComponent
        transfer={transfer}
        associatedAddresses={associatedAddresses}
      />
      <Row label="Token address" value={transfer.tokenInfo.address} />
      <Row label="Symbol" value={transfer.tokenInfo.symbol} />
      <Row label="Name" value={transfer.tokenInfo.name} />
      <Row
        label="Amount"
        value={toFullAmount(transfer.value, transfer.tokenInfo.decimals)}
      />
    </div>
  )
}

function toFullAmount(value: string, decimals: number) {
  return Number(value) / Math.pow(10, decimals)
}

function isEtherTransfer(transfer: unknown): transfer is EtherTransfer {
  return EtherTransfer.safeParse(transfer).success
}

function isErc20Transfer(transfer: unknown): transfer is ERC20Transfer {
  return ERC20Transfer.safeParse(transfer).success
}
