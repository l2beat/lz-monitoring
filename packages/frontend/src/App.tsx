import { DiscoveryApi } from '@lz/libs'
import { useEffect, useState } from 'react'

import { CurrentNetwork } from './view/components/CurrentNetwork'
import { EndpointContract } from './view/components/EndpointContract'
import { Layout } from './view/components/Layout'
import { Navbar } from './view/components/Navbar'

export function App(): JSX.Element {
  const [data, setData] = useState<DiscoveryApi | null>(null)

  useEffect(() => {
    async function fetchData(): Promise<void> {
      const result = await fetch('http://localhost:3000/discovery')
      const data = await result.text()
      const parsed = DiscoveryApi.parse(JSON.parse(data))
      setData(parsed)
    }

    void fetchData()
  })

  return (
    <>
      <Navbar />
      <Layout>
        <CurrentNetwork latestBlock={data?.blockNumber} />
        <EndpointContract {...data?.contracts.endpoint} />
      </Layout>
    </>
  )
}
