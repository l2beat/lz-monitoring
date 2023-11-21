import { ChainId, endpoints } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { NetworkData } from '../NetworkData'
import { NetworkDropdownSelector } from '../NetworkSelector'
import { Warning } from '../Warning'
import { EndpointContract } from './EndpointContract'
import { LayerZeroMultisig } from './LayerZeroMultisig'
import { UltraLightNodeContract } from './UltraLightNode'

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
      <EndpointContract {...discoveryResponse.data.contracts.endpoint} />
      <UltraLightNodeContract {...discoveryResponse.data.contracts.ulnV2} />

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
