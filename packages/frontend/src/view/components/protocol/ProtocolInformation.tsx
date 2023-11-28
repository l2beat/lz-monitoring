import { ChainId, endpoints, getPrettyChainName } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import { AddressInfoContext } from '../../../hooks/addressInfoContext'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { Layout } from '../Layout'
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

  if (!chainsToDisplay.includes(paramChain)) {
    setParamChain(chainsToDisplay[0])
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
          setChain={setChain}
        />
        {isError && (
          <Warning
            title={`Failed to load data for ${getPrettyChainName(paramChain)}`}
            subtitle="Insights might not be yet available. Please try again later."
          />
        )}
      </>
    )
  }

  return (
    <SkeletonTheme baseColor="#27272A" highlightColor="#525252">
      <AddressInfoContext.Provider value={discoveryResponse.data.addressInfo}>
        <NetworkDropdownSelector
          chainId={discoveryResponse.chainId}
          chainsToDisplay={chainsToDisplay}
          setChain={setChain}
        />
        <NetworkData
          chainId={discoveryResponse.chainId}
          latestBlock={discoveryResponse.data.blockNumber}
        />
        <Layout>
          <EndpointContract
            chainId={discoveryResponse.chainId}
            {...discoveryResponse.data.contracts.endpoint}
          />
          <UltraLightNodeContract
            chainId={discoveryResponse.chainId}
            {...discoveryResponse.data.contracts.ulnV2}
          />

          {shouldDisplayMultisigTransactions && (
            <LayerZeroMultisig
              {...discoveryResponse.data.contracts.lzMultisig}
              multisigAddress={multisigAddress}
              chainId={discoveryResponse.chainId}
            />
          )}
        </Layout>
      </AddressInfoContext.Provider>
    </SkeletonTheme>
  )
}
