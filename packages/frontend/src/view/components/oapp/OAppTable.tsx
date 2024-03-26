import { ChainId, OAppsResponse } from '@lz/libs'
import Skeleton from 'react-loading-skeleton'

import { OAppRow } from './OAppRow'

export function OAppTable({ oAppsList }: { oAppsList: OAppsResponse }) {
  return (
    <OAppTableWrapper>
      {oAppsList.oApps.map((oApp) => (
        <OAppRow
          key={oApp.name}
          oApp={oApp}
          defaults={oAppsList.defaultConfigurations}
          sourceChain={ChainId.ETHEREUM}
        />
      ))}
    </OAppTableWrapper>
  )
}

export function OAppTableSkeleton() {
  return (
    <OAppTableWrapper>
      <Skeleton className="mt-3" />
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </OAppTableWrapper>
  )
}

function OAppTableWrapper({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="mt-10 overflow-x-auto rounded bg-gray-900 px-7 py-5">
      <div className="col-span-5 grid min-w-[800px] grid-cols-applications rounded bg-gray-600 py-3 text-left text-[13px] font-semibold text-gray-50">
        <div className="px-6">TOKEN</div>
        <div>SOURCE CHAIN</div>
        <div>ADDRESS</div>
        <div>PATHWAYS</div>
        <div>CONFIG</div>
        <div />
      </div>

      {children}
    </div>
  )
}
