import { ChainId, endpoints, getPrettyChainName } from '@lz/libs'
import { useState } from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../../../config'
import {
  PROTOCOL_VERSION,
  ProtocolVersion,
} from '../../../constants/protocol-version'
import { AddressInfoContext } from '../../../hooks/addressInfoContext'
import { ChainInfoContext } from '../../../hooks/chainIdContext'
import { useChainQueryParam } from '../../../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../../../hooks/useDiscoveryApi'
import { Layout } from '../Layout'
import { NetworkData } from '../NetworkData'
import { NetworkSelector } from '../NetworkSelector'
import { VersionButton, VersionSwitch } from '../VersionSwitch'
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

  const [version, setVersion] = useState<ProtocolVersion>(defaultVersion)
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
          {config.features.v2visible && (
            <VersionSwitch>
              <VersionButton
                isActive={version === PROTOCOL_VERSION.V1}
                onClick={() => {
                  setVersion(PROTOCOL_VERSION.V1)
                }}
              >
                LayerZero V1
              </VersionButton>
              <VersionButton
                isActive={version === PROTOCOL_VERSION.V2}
                onClick={() => {
                  setVersion(PROTOCOL_VERSION.V2)
                }}
              >
                LayerZero V2
              </VersionButton>
            </VersionSwitch>
          )}
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
              </>
            )}
          </Layout>
        </AddressInfoContext.Provider>
      </ChainInfoContext.Provider>
    </SkeletonTheme>
  )
}
