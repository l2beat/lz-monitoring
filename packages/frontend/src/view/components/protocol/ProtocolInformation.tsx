import { ChainId, endpoints, getPrettyChainName } from '@lz/libs'
import { useState } from 'react'
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
  const [version, setVersion] = useState<'v1' | 'v2'>('v2')
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
          <div className="flex items-center justify-center gap-5 p-4">
            <VersionButton
              onClick={() => {
                setVersion('v1')
                console.log(`set version to v1 from ${version}`)
              }}
            >
              v1
            </VersionButton>
            <VersionButton
              onClick={() => {
                setVersion('v2')
                console.log(`set version to v2 from ${version}`)
              }}
            >
              v2
            </VersionButton>
          </div>
          <Layout>
            {version === 'v1' && (
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

            {version === 'v2' && (
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

function VersionButton(props: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={props.onClick}
      className="rounded-lg bg-yellow-100 p-4 text-xl font-medium text-black"
    >
      {props.children}
    </button>
  )
}
