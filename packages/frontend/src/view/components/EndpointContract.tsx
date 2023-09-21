import { EthereumAddress } from '@lz/libs'

interface EndpointContractProps {
  address?: EthereumAddress
  owner?: EthereumAddress
  defaultSendLibrary?: EthereumAddress
  defaultReceiveLibrary?: EthereumAddress
  libraryLookup?: EthereumAddress[]
}

export function EndpointContract(props: EndpointContractProps): JSX.Element {
  return (
    <section className="mx-6 mb-12 border-t border-orange bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-orange">Endpoint</h2>
        <span className="font-mono text-gray-600">{props.address}</span>
      </div>

      {[
        { label: 'Owner', value: props.owner },
        { label: 'Default send library', value: props.defaultSendLibrary },
        {
          label: 'Default receive library',
          value: props.defaultReceiveLibrary,
        },
        // TODO: add library lookup as a dropdown
      ].map(({ label, value }) => (
        <div className="flex border-y border-black bg-gray-800 px-8 py-3">
          <span className="w-[214px] font-medium text-gray-500">{label}</span>
          <span className="font-mono">{value}</span>
        </div>
      ))}
    </section>
  )
}
