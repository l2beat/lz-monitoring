import { EthereumAddress } from '@lz/libs'
import Skeleton from 'react-loading-skeleton'

interface Props {
  address?: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
  isLoading: boolean
}

export function EndpointContract(props: Props): JSX.Element {
  return (
    <section className="mx-6 mb-12 border-t border-orange bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-orange">Endpoint</h2>
        <div className="font-mono text-gray-600">
          {props.isLoading ? <Skeleton width="350px" /> : props.address}
        </div>
      </div>

      {[
        { label: 'Owner', value: props.owner },
        { label: 'Default send library', value: props.defaultSendLibrary },
        {
          label: 'Default receive library',
          value: props.defaultReceiveLibrary,
        },
        // TODO: add library lookup as a dropdown
      ].map(({ label, value }, i) =>
        props.isLoading ? (
          <DataBlock
            label={label}
            value={<Skeleton width={'400px'} />}
            key={i}
          />
        ) : (
          <DataBlock label={label} value={value} key={i} />
        ),
      )}
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
    <div className="flex border-y border-black bg-gray-800 px-8 py-3">
      <span className="w-[214px] font-medium text-gray-500">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  )
}
