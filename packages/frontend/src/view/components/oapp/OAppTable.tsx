import { ChainId, OAppsResponse } from '@lz/libs'

import { OAppRow } from './OAppRow'

export function OAppTable({ oAppsList }: { oAppsList: OAppsResponse }) {
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
      {oAppsList.oApps.map((oApp) => (
        <OAppRow
          key={oApp.name}
          oApp={oApp}
          defaults={oAppsList.defaultConfigurations}
          sourceChain={ChainId.ETHEREUM}
        />
      ))}
    </div>
  )
}
