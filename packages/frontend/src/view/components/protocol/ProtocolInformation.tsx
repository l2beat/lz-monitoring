import { ChainId, endpoints, getPrettyChainName } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import { PROTOCOL_VERSION } from '../../../constants/protocol-version'
import { AddressInfoContext } from '../../../hooks/addressInfoContext'
import { ChainInfoContext } from '../../../hooks/chainIdContext'
import { useSafeChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { useVersionQueryParam } from '../../../hooks/useVersionQueryParam'
import { Layout } from '../Layout'
import { NetworkData } from '../NetworkData'
import { Selectors } from '../selectors/Selectors'
import { Warning } from '../Warning'
import { EndpointContract } from './EndpointContract'
import { EndpointV2Contract } from './EndpointV2Contract'
import { LayerZeroMultisig } from './LayerZeroMultisig'
import { ReceiveUln301Contract } from './ReceiveUln301'
import { ReceiveUln302Contract } from './ReceiveUln302'
import { SendUln301Contract } from './SendUln301'
import { SendUln302Contract } from './SendUln302'
import { UltraLightNodeContract } from './UltraLightNode'

export function ProtocolInformation({
  chainsToDisplay,
}: {
  chainsToDisplay: [ChainId, ...ChainId[]]
}): JSX.Element {
  const defaultVersion = config.features.v2visible
    ? PROTOCOL_VERSION.V2
    : PROTOCOL_VERSION.V1

  const [version, setVersion] = useVersionQueryParam('version', defaultVersion)

  const [paramChain, setParamChain] = useSafeChainQueryParam(
    'chain',
    chainsToDisplay[0],
  )

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
        <Selectors
          chainId={paramChain}
          setChain={setChain}
          chainsToDisplay={chainsToDisplay}
          version={version}
          setVersion={setVersion}
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
      <Selectors
        chainId={discoveryResponse.chainId}
        setChain={setChain}
        chainsToDisplay={chainsToDisplay}
        version={version}
        setVersion={setVersion}
      />
      <ChainInfoContext.Provider value={discoveryResponse.chainId}>
        <AddressInfoContext.Provider value={discoveryResponse.data.addressInfo}>
          <NetworkData
            version={version}
            latestBlock={discoveryResponse.data.blockNumber}
            isLoading={isDiscoveryLoading}
          />

          <Layout>
            {version === PROTOCOL_VERSION.V1 && (
              <>
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
              </>
            )}

            {version === PROTOCOL_VERSION.V2 && (
              <>
                <EndpointV2Contract
                  {...discoveryResponse.data.contracts.endpointV2}
                  isLoading={isDiscoveryLoading}
                />
                <SendUln302Contract
                  {...discoveryResponse.data.contracts.sendUln302}
                  isLoading={isDiscoveryLoading}
                />
                <ReceiveUln302Contract
                  {...discoveryResponse.data.contracts.receiveUln302}
                  isLoading={isDiscoveryLoading}
                />{' '}
                <SendUln301Contract
                  {...discoveryResponse.data.contracts.sendUln301}
                  isLoading={isDiscoveryLoading}
                />
                <ReceiveUln301Contract
                  {...discoveryResponse.data.contracts.receiveUln301}
                  isLoading={isDiscoveryLoading}
                />
                {shouldDisplayMultisigTransactions && (
                  <LayerZeroMultisig
                    {...discoveryResponse.data.contracts.lzMultisig}
                    multisigAddress={multisigAddress}
                  />
                )}
              </>
            )}
          </Layout>
        </AddressInfoContext.Provider>
      </ChainInfoContext.Provider>
    </SkeletonTheme>
  )
}
