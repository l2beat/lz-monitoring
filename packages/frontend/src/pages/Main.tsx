import { ChainId, endpoints } from '@lz/libs'

import { config } from '../config'
import { useChainQueryParam } from '../hooks/useChainQueryParam'
import { useDiscoveryApi } from '../hooks/useDiscoveryApi'
import { CurrentNetwork } from '../view/components/CurrentNetwork'
import { EndpointContract } from '../view/components/EndpointContract'
import { LzMultisig } from '../view/components/LayerZeroMultisig'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { QueuedTransactions } from '../view/components/safe/QueuedTransactions'
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

  return (
    <>
      <Navbar />
      <Layout>
        <CurrentNetwork
          latestBlock={discoveryResponse?.blockNumber}
          chainId={paramChain}
          setChainId={setChain}
          availableChains={config.availableChains}
        />
        <EndpointContract {...discoveryResponse?.contracts.endpoint} />
        <ULNv2Contract {...discoveryResponse?.contracts.ulnV2} />
        <LzMultisig {...discoveryResponse?.contracts.lzMultisig} />
        {multisigAddress && endpoints.isChainSupported(paramChain.valueOf()) ? (
          <QueuedTransactions
            multisigAddress={multisigAddress}
            chainId={paramChain}
          />
        ) : (
          <div> Protocol on this chain is not owned by Safe Multisig</div>
        )}
      </Layout>
    </>
  )
}
