import { ChainId, getPrettyChainName, OAppWithConfigs } from '@lz/libs'
import cx from 'classnames'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { config } from '../config'
import { useTrackingApi } from '../hooks/useTrackingApi'
import { BlockchainAddress } from '../view/components/BlockchainAddress'
import { BlockchainIcon } from '../view/components/BlockchainIcon'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { PaginatedContainer } from '../view/components/PaginatedContainer'
import { Row } from '../view/components/Row'
import { Tooltip } from '../view/components/Tooltip'
import { SolidMinusIcon } from '../view/icons/MinusIcon'
import { SolidPlusIcon } from '../view/icons/PlusIcon'
import { SimpleArrowIcon } from '../view/icons/SimpleArrowIcon'
import { WarningIcon } from '../view/icons/WarningIcon'

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
        <div className="mt-10 overflow-x-auto rounded bg-gray-900 px-7 py-5">
          <div className="col-span-5 grid min-w-[800px] grid-cols-applications rounded bg-gray-700 py-3 text-left text-[13px] font-semibold text-gray-50">
            <div className="px-6">TOKEN</div>
            <div>SOURCE CHAIN</div>
            <div>ADDRESS</div>
            <div>CONFIG</div>
            <div />
          </div>
          <PaginatedContainer itemsPerPage={12} page={1}>
            {oApps.data.oApps.map((oApp) => (
              <OAppRow
                key={oApp.name}
                oApp={oApp}
                sourceChain={ChainId.ETHEREUM}
              />
            ))}
          </PaginatedContainer>
        </div>
      </Layout>
    </>
  )
}

function OAppRow(props: { oApp: OAppWithConfigs; sourceChain: ChainId }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const navigate = useNavigate()

  const hasAnyCustomConfig = props.oApp.configurations.some(
    (config) => !config.isDefault,
  )
  const hasDefaultConfig = !hasAnyCustomConfig

  function forwardToDefaults() {
    navigate('/')
  }

  function toggleExpand() {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cx(
        'col-span-full grid-cols-applications-small border-b border-gray-700 py-3 text-xs last:rounded-b last:border-none md:min-w-[800px] md:grid-cols-applications',
        isExpanded ? 'rounded border-none bg-gray-750' : 'bg-gray-800',
      )}
    >
      <div className="grid grid-cols-applications-small md:min-w-[800px] md:grid-cols-applications">
        <span className="flex items-center gap-2 px-4 md:px-6">
          {props.oApp.iconUrl && (
            <img
              src={props.oApp.iconUrl}
              alt={props.oApp.name}
              className="h-5 w-5 rounded-full"
            />
          )}
          {props.oApp.name} ({props.oApp.symbol})
        </span>
        <span className="flex items-center gap-1">
          {getPrettyChainName(props.sourceChain)}
          {<BlockchainIcon chainId={props.sourceChain} />}
        </span>
        <span>
          <BlockchainAddress address={props.oApp.address} />
        </span>
        <span>
          {hasDefaultConfig ? <DefaultConfigBadge /> : <CustomConfigBadge />}
        </span>
        <button
          className="brightness-100 filter transition-all duration-300 hover:brightness-[120%]"
          onClick={hasDefaultConfig ? forwardToDefaults : toggleExpand}
        >
          {hasDefaultConfig ? (
            <SolidArrowRight />
          ) : isExpanded ? (
            <SolidMinusIcon />
          ) : (
            <SolidPlusIcon />
          )}
        </button>
      </div>

      {isExpanded && !hasDefaultConfig && (
        <div className="mx-5 mt-3 rounded bg-gray-500 px-8 py-4">
          {props.oApp.configurations.map(
            (config) =>
              !config.isDefault && (
                <CustomConfig
                  key={config.targetChainId.toString()}
                  config={config}
                />
              ),
          )}
        </div>
      )}
    </div>
  )
}

function CustomConfig(props: {
  config: OAppWithConfigs['configurations'][number] & { isDefault: false }
}) {
  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1.5">
        {getPrettyChainName(props.config.targetChainId)}
        {<BlockchainIcon chainId={props.config.targetChainId} />}
      </span>
      <div className="pt-2">
        {Object.entries(props.config.changedConfiguration).map(
          ([property, value]) => (
            <Row
              dense
              label={property}
              value={
                <div className="flex items-center gap-2">
                  {value}
                  <Tooltip
                    text="This property differs from the default"
                    variant="text"
                  >
                    <WarningIcon className="h-4 w-4 stroke-yellow-100" />
                  </Tooltip>
                </div>
              }
            />
          ),
        )}
      </div>
    </div>
  )
}

function DefaultConfigBadge() {
  return (
    <Tooltip
      text="This application is using default configuration provided by LayerZero"
      variant="text"
    >
      <div
        className={cx(
          'flex h-[22px] max-w-fit items-center justify-center rounded bg-gray-100 px-2 text-2xs',
        )}
      >
        DEFAULT
      </div>
    </Tooltip>
  )
}

function CustomConfigBadge() {
  return (
    <Tooltip
      text="This application has changed its configuration"
      variant="text"
    >
      <div
        className={cx(
          'flex h-[22px] max-w-fit items-center justify-center rounded bg-[#D88641] px-2 text-2xs',
        )}
      >
        CUSTOM
      </div>
    </Tooltip>
  )
}

function SolidArrowRight() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded bg-yellow-100">
      <SimpleArrowIcon width={10} height={10} />
    </div>
  )
}
