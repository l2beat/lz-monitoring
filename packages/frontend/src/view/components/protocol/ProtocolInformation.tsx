import { ChainId, endpoints } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { NetworkData } from '../NetworkData'
import { NetworkDropdownSelector } from '../NetworkSelector'
import { Warning } from '../Warning'
import { LayerZeroMultisig } from './LayerZeroMultisig'

export function ProtocolInformation({
  chainsToDisplay,
}: {
  chainsToDisplay: [ChainId, ...ChainId[]]
}): JSX.Element {
  const [paramChain, setParamChain] = useChainQueryParam({
    fallback: chainsToDisplay[0],
    paramName: 'chain',
  })

  const [discoveryResponse, , isError] = useDiscoveryApi({
    apiUrl: config.apiUrl,
    chainId: paramChain,
  })

  function setChain(chain: ChainId) {
    setParamChain(chain)
  }

  const multisigAddress = discoveryResponse?.data.contracts.lzMultisig?.address

  const shouldDisplayMultisigTransactions =
    multisigAddress &&
    endpoints.isChainSupported(discoveryResponse.chainId.valueOf())

  if (!discoveryResponse || isError) {
    return (
      <>
        <NetworkDropdownSelector
          chainId={paramChain}
          chainsToDisplay={chainsToDisplay}
          setChainId={setChain}
        />
        {isError && (
          <Warning
            title={`Failed to load data for ${ChainId.getName(paramChain)}`}
            subtitle="Insights might not be yet available. Please try again later."
          />
        )}
      </>
    )
  }

  return (
    <>
      <NetworkDropdownSelector
        chainId={discoveryResponse.chainId}
        chainsToDisplay={chainsToDisplay}
        setChainId={setChain}
      />
      <NetworkData
        chainId={discoveryResponse.chainId}
        latestBlock={discoveryResponse.data.blockNumber}
      />
      {/* <EndpointContract {...discoveryResponse.data.contracts.endpoint} />
      <UltraLightNodeContract {...discoveryResponse.data.contracts.ulnV2} /> */}

      {shouldDisplayMultisigTransactions && (
        <SkeletonTheme baseColor="#27272A" highlightColor="#525252">
          <LayerZeroMultisig
            {...discoveryResponse.data.contracts.lzMultisig}
            multisigAddress={multisigAddress}
            chainId={discoveryResponse.chainId}
          />
        </SkeletonTheme>
      )}
    </>
  )
}

// function getAssociatedAddresses(
//   discoveryResponse: DiscoveryApi,
// ): EthereumAddress[] {
//   const multisig = discoveryResponse.contracts.lzMultisig?.address ?? []

//   const multisigOwners =
//     discoveryResponse.contracts.lzMultisig?.owners.map((owner) => {
//       return owner
//     }) ?? []

//   const ulnV2 = discoveryResponse.contracts.ulnV2.address
//   const endpoint = discoveryResponse.contracts.endpoint.address

//   const allAddresses = [multisig, multisigOwners, ulnV2, endpoint].flat()

//   const nonZeroAddresses = allAddresses.filter((address) => {
//     return address !== EthereumAddress.ZERO
//   })

//   return Array.from(new Set(nonZeroAddresses))
// }
