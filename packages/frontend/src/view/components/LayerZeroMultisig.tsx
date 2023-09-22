import { EthereumAddress } from '@lz/libs'

interface LzMultisigProps {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
}

export function LzMultisig(props: LzMultisigProps): JSX.Element {
  return (
    <section className="mx-6 mb-12 border-t border-blue bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-blue">
          LayerZero Multisig
        </h2>
        <span className="font-mono text-gray-600">{props.address}</span>
      </div>
      <div className="flex border-y border-black bg-gray-800 px-8 py-3">
        <span className="w-[214px] font-medium text-gray-500">Threshold</span>
        <span className="font-mono">
          {props.threshold &&
            props.owners &&
            `${props.threshold}/${props.owners.length}`}
        </span>
      </div>
      <div className="flex items-center bg-gray-800 px-8">
        <span className="w-[214px] font-medium text-gray-500">Owners</span>
        <pre className="grow overflow-auto border border-gray-700 bg-gray-900 p-6 font-mono text-gray-500">
          {JSON.stringify(props.owners, null, 2)}
        </pre>
      </div>
    </section>
  )
}
