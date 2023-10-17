import { ChainId, DiscoveryApi, endpoints, EthereumAddress } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../config'
import { useChainQueryParam } from '../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../hooks/useDiscoveryApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { NetworkData } from '../view/components/NetworkData'
import { NetworkError } from '../view/components/NetworkError'
import { NetworkDropdownSelector } from '../view/components/NetworkSelector'
import { EndpointContract } from '../view/components/protocol/EndpointContract'
import { LayerZeroMultisig } from '../view/components/protocol/LayerZeroMultisig'
import { UltraLightNodeContract } from '../view/components/protocol/UltraLightNode'
import { MultisigTransactions } from '../view/components/safe/MultisigTransactions'

export function Main(): JSX.Element {
  const [paramChain, setParamChain] = useChainQueryParam({
    fallback: ChainId.ETHEREUM,
    paramName: 'chain',
  })
  const [discoveryResponse, , isError] = useDiscoveryApi({
    apiUrl: config.apiUrl,
    chainId: paramChain,
  })

  function setChain(chain: ChainId) {
    setParamChain(chain)
  }

  // Restrict valid chains only to those that are turned on
  // i.e bsc is a valid chain name but it is not turned on
  if (!config.availableChains.includes(paramChain)) {
    setChain(ChainId.ETHEREUM)
  }

  const multisigAddress = discoveryResponse?.data.contracts.lzMultisig?.address

  const associatedAddresses = discoveryResponse
    ? getAssociatedAddresses(discoveryResponse.data)
    : []

  const shouldDisplayMultisigTransactions =
    multisigAddress &&
    endpoints.isChainSupported(discoveryResponse.chainId.valueOf())

  if (!discoveryResponse) {
    return (
      <>
        <Navbar />
        <Layout>
          <NetworkDropdownSelector
            chainId={paramChain}
            availableChains={config.availableChains}
            setChainId={setChain}
          />
          {isError && <NetworkError />}
        </Layout>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Layout>
        <SkeletonTheme baseColor="#0D0D0D" highlightColor="#525252">
          <NetworkDropdownSelector
            chainId={discoveryResponse.chainId}
            availableChains={config.availableChains}
            setChainId={setChain}
          />
          <NetworkData
            chainId={discoveryResponse.chainId}
            latestBlock={discoveryResponse.data.blockNumber}
          />
          <EndpointContract {...discoveryResponse.data.contracts.endpoint} />
          <UltraLightNodeContract {...discoveryResponse.data.contracts.ulnV2} />

          <LayerZeroMultisig {...discoveryResponse.data.contracts.lzMultisig} />
          {shouldDisplayMultisigTransactions && (
            <MultisigTransactions
              multisigAddress={multisigAddress}
              chainId={discoveryResponse.chainId}
              associatedAddresses={associatedAddresses}
            />
          )}
        </SkeletonTheme>
      </Layout>
    </>
  )
}

function getAssociatedAddresses(
  discoveryResponse: DiscoveryApi,
): EthereumAddress[] {
  const multisig = discoveryResponse.contracts.lzMultisig?.address ?? []

  const multisigOwners =
    discoveryResponse.contracts.lzMultisig?.owners.map((owner) => {
      return owner
    }) ?? []

  const ulnV2 = discoveryResponse.contracts.ulnV2.address
  const endpoint = discoveryResponse.contracts.endpoint.address

  const allAddresses = [multisig, multisigOwners, ulnV2, endpoint].flat()

  const nonZeroAddresses = allAddresses.filter((address) => {
    return address !== EthereumAddress.ZERO
  })

  return Array.from(new Set(nonZeroAddresses))
}
