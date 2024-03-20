import { ChainId } from '@lz/libs'

import { config } from '../config'
import { useTrackingApi } from '../hooks/useTrackingApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { OAppTable } from '../view/components/oapp/OAppTable'

export function Applications() {
  const chainsToDisplay = [ChainId.ETHEREUM] as [ChainId, ...ChainId[]]

  const [oApps, isLoading, isError] = useTrackingApi({
    chainId: chainsToDisplay[0],
    apiUrl: config.apiUrl,
  })

  if (!oApps || isLoading) {
    return 'Loading'
  }

  if (isError) {
    return 'Error'
  }

  return (
    <>
      <Navbar />

      <Layout>
        <OAppTable oAppsList={oApps.data} />
      </Layout>
    </>
  )
}
