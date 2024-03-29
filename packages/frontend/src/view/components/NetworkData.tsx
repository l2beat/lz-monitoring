import { EndpointID } from '@lz/libs'

import {
  PROTOCOL_VERSION,
  ProtocolVersion,
} from '../../constants/protocol-version'
import { useChainId } from '../../hooks/chainIdContext'
import { MaxWidthLayout } from './Layout'
import { LoadingCover } from './status/LoadingCover'

interface Props {
  latestBlock: number
  version: ProtocolVersion
  isLoading?: boolean
}

export function NetworkData({
  latestBlock,
  version,
  isLoading,
}: Props): JSX.Element {
  const encode =
    version === PROTOCOL_VERSION.V1 ? EndpointID.encodeV1 : EndpointID.encodeV2
  const chainId = useChainId()
  const endpointId = encode(chainId)

  return (
    <section className="mb-4 bg-gray-900 p-4 md:mb-10 md:p-8">
      <MaxWidthLayout>
        <section className="relative flex items-stretch gap-2.5 md:gap-5">
          {isLoading && <LoadingCover />}
          <DataBlock label="Chain ID" value={chainId.toString()} />
          <DataBlock label="Endpoint ID" value={endpointId} />
          <DataBlock label="Latest block" value={latestBlock} />
        </section>
      </MaxWidthLayout>
    </section>
  )
}

function DataBlock({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 rounded-lg bg-gray-800 px-2 py-4 md:gap-4 md:pb-8 md:pt-6">
      <label className="text-xs text-gray-100">{label}</label>
      <span className="text-lg font-semibold md:text-xxl">{value}</span>
    </div>
  )
}
