import { ChainId } from '@lz/libs'
import { SkeletonTheme } from 'react-loading-skeleton'

import { config } from '../config'
import { AddressInfoContext } from '../hooks/addressInfoContext'
import { useTrackingApi } from '../hooks/useTrackingApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { OAppTable, OAppTableSkeleton } from '../view/components/oapp/OAppTable'
import { Warning } from '../view/components/Warning'

export function Applications() {
  const chainsToDisplay = [ChainId.ETHEREUM] as [ChainId, ...ChainId[]]

  const [oApps, isLoading, isError] = useTrackingApi({
    chainId: chainsToDisplay[0],
    apiUrl: config.apiUrl,
  })

  if (isLoading) {
    return (
      <Page>
        <SkeletonTheme baseColor="#27272A" highlightColor="#525252">
          <OAppTableSkeleton />
        </SkeletonTheme>
      </Page>
    )
  }

  if (!oApps || isError) {
    return (
      <Page>
        <Warning
          title="Could not load applications"
          subtitle="Applications API might be unreachable or no applications were discovered. Please try again later."
        />
      </Page>
    )
  }

  return (
    <Page>
      <AddressInfoContext.Provider value={oApps.data.addressInfo}>
        <OAppTable oAppsList={oApps.data} />
      </AddressInfoContext.Provider>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Layout>{children}</Layout>
    </>
  )
}
