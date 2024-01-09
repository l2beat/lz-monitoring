import { ChainId, endpoints, getPrettyChainName } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import { AddressInfoContext } from '../../../hooks/addressInfoContext'
import { ChainInfoContext } from '../../../hooks/chainIdContext'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { Layout } from '../Layout'
import { NetworkData } from '../NetworkData'
import { NetworkSelector } from '../NetworkSelector'
import { Warning } from '../Warning'
import { EndpointContract } from './EndpointContract'
import { EndpointV2Contract } from './EndpointV2Contract'
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

  const [discoveryResponse, isDiscoveryLoading, isError] = useDiscoveryApi({
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
        <NetworkSelector
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
      <NetworkSelector
        chainId={discoveryResponse.chainId}
        chainsToDisplay={chainsToDisplay}
        setChain={setChain}
      />
      <ChainInfoContext.Provider value={discoveryResponse.chainId}>
        <AddressInfoContext.Provider value={discoveryResponse.data.addressInfo}>
          <NetworkData
            latestBlock={discoveryResponse.data.blockNumber}
            isLoading={isDiscoveryLoading}
          />
          <Layout>
            <EndpointV2Contract
              {...discoveryResponse.data.contracts.endpointV2}
              isLoading={isDiscoveryLoading}
            />
            <EndpointContract
              {...discoveryResponse.data.contracts.endpoint}
              isLoading={isDiscoveryLoading}
            />
            <UltraLightNodeContract
              {...discoveryResponse.data.contracts.ulnV2}
              isLoading={isDiscoveryLoading}
            />

            {shouldDisplayMultisigTransactions && (
              <LayerZeroMultisig
                {...discoveryResponse.data.contracts.lzMultisig}
                multisigAddress={multisigAddress}
              />
            )}
          </Layout>
        </AddressInfoContext.Provider>
      </ChainInfoContext.Provider>
    </SkeletonTheme>
  )
}
