import { DiscoveryApi } from '@lz/libs'
import { useEffect, useState } from 'react'

import { Config } from './config/Config'
import { CurrentNetwork } from './view/components/CurrentNetwork'
import { EndpointContract } from './view/components/EndpointContract'
import { LzMultisig } from './view/components/LayerZeroMultisig'
import { Layout } from './view/components/Layout'
import { Navbar } from './view/components/Navbar'
import { ULNv2Contract } from './view/components/ULNv2Contract'

interface AppProps {
  config: Config
}

export function App(props: AppProps): JSX.Element {
  const [data, setData] = useState<DiscoveryApi | null>(null)

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await fetch(props.config.apiUrl + 'discovery', {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
      const data = await result.text()
      const parsed = DiscoveryApi.parse(JSON.parse(data))
      setData(parsed)
    }

    void fetchData()
    setInterval(() => {
      void fetchData()
    }, 10 * 1000)
  }, [props.config.apiUrl])

  return (
    <>
      <Navbar />
      <Layout>
        <CurrentNetwork latestBlock={data?.blockNumber} />
        <EndpointContract {...data?.contracts.endpoint} />
        <ULNv2Contract {...data?.contracts.ulnV2} />
        <LzMultisig {...data?.contracts.lzMultisig} />
      </Layout>
    </>
  )
}
