import { EthereumAddress } from '@lz/libs'

interface LzMultisigProps {
  address?: EthereumAddress
  threshold?: number
  owners?: EthereumAddress[]
}

export function LzMultisig({
  owners,
  address,
  threshold,
}: LzMultisigProps): JSX.Element {
  // Currently lack of multisig data is dictated either lack of support for multisig for given chain or we lack some data (this must be addressed in the future)
  const hasData = address && threshold && owners

  return (
    <section className="mx-6 mb-12 border-t border-blue bg-gray-900">
      <div className="flex items-center justify-between p-8">
        <h2 className="text-2xl text-lg font-medium text-blue">
          LayerZero Multisig
        </h2>
        {address ? (
          <span className="font-mono text-gray-600">{address}</span>
        ) : (
          <span className="font-mono text-gray-600">
            Protocol on this chain is not owned by Safe Multisig
          </span>
        )}
      </div>

      {hasData && (
        <>
          <div className="flex border-y border-black bg-gray-800 px-8 py-3">
            <span className="w-[214px] font-medium text-gray-500">
              Threshold
            </span>
            <span className="font-mono">{`${threshold}/${owners.length}`}</span>
          </div>
          <div className="flex items-center bg-gray-800 px-8">
            <span className="w-[214px] font-medium text-gray-500">Owners</span>
            <pre className="grow overflow-auto border border-gray-700 bg-gray-900 p-6 font-mono text-gray-500">
              {JSON.stringify(owners, null, 2)}
            </pre>
          </div>
        </>
      )}
    </section>
  )
}
