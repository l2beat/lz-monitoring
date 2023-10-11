import { ChainId, DiscoveryApi, endpoints, EthereumAddress } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../config'
import { useChainQueryParam } from '../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../hooks/useDiscoveryApi'
import { CurrentNetwork } from '../view/components/CurrentNetwork'
import { EndpointContract } from '../view/components/EndpointContract'
import { LzMultisig } from '../view/components/LayerZeroMultisig'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { MultisigTransactions } from '../view/components/safe/MultisigTransactions'
import { ULNv2Contract } from '../view/components/ULNv2Contract'

export function Main(): JSX.Element {
  const [paramChain, setParamChain] = useChainQueryParam({
    fallback: ChainId.ETHEREUM,
    paramName: 'chain',
  })
  const [discoveryResponse, setRequestChainId] = useDiscoveryApi({
    apiUrl: config.apiUrl,
    initialChainId: paramChain,
  })

  function setChain(chain: ChainId) {
    setParamChain(chain)
    setRequestChainId(chain)
  }

  // Restrict valid chains only to those that are turned on
  // i.e bsc is a valid chain name but it is not turned on
  if (!config.availableChains.includes(paramChain)) {
    setChain(ChainId.ETHEREUM)
  }

  const multisigAddress = discoveryResponse?.contracts.lzMultisig?.address

  const associatedAddresses = discoveryResponse
    ? getAssociatedAddresses(discoveryResponse)
    : []

  const shouldDisplayMultisigTransactions =
    multisigAddress && endpoints.isChainSupported(paramChain.valueOf())

  return (
    <>
      <Navbar />
      <Layout>
        <SkeletonTheme baseColor="#ff0000">
          <CurrentNetwork
            latestBlock={discoveryResponse?.blockNumber}
            chainId={paramChain}
            setChainId={setChain}
            availableChains={config.availableChains}
          />
          <EndpointContract {...discoveryResponse?.contracts.endpoint} />
          <ULNv2Contract {...discoveryResponse?.contracts.ulnV2} />
          <LzMultisig {...discoveryResponse?.contracts.lzMultisig} />

          {shouldDisplayMultisigTransactions && (
            <MultisigTransactions
              multisigAddress={multisigAddress}
              chainId={paramChain}
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

  const normalizedAddresses = Array.from(
    new Set(
      nonZeroAddresses.filter((address) => {
        return address !== EthereumAddress.ZERO
      }),
    ),
  )

  return normalizedAddresses
}
