import {
  ChainId,
  getPrettyChainName,
  OAppsResponse,
  OAppWithConfigs,
} from '@lz/libs'
import cx from 'classnames'
import { ReactNode, useState } from 'react'

import { config } from '../config'
import { useTrackingApi } from '../hooks/useTrackingApi'
import { BlockchainAddress } from '../view/components/BlockchainAddress'
import { BlockchainIcon } from '../view/components/BlockchainIcon'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { Row } from '../view/components/Row'
import { Tooltip } from '../view/components/Tooltip'
import { SolidMinusIcon } from '../view/icons/MinusIcon'
import { SolidPlusIcon } from '../view/icons/PlusIcon'
import { SimpleArrowIcon } from '../view/icons/SimpleArrowIcon'

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
          <div className="col-span-5 grid min-w-[800px] grid-cols-applications rounded bg-gray-600 py-3 text-left text-[13px] font-semibold text-gray-50">
            <div className="px-6">TOKEN</div>
            <div>SOURCE CHAIN</div>
            <div>ADDRESS</div>
            <div>PATHWAYS</div>
            <div>CONFIG</div>
            <div />
          </div>
          {oApps.data.oApps.map((oApp) => (
            <OAppRow
              key={oApp.name}
              oApp={oApp}
              defaults={oApps.data.defaultConfigurations}
              sourceChain={ChainId.ETHEREUM}
            />
          ))}
        </div>
      </Layout>
    </>
  )
}

function OAppRow(props: {
  oApp: OAppWithConfigs
  sourceChain: ChainId
  defaults: OAppsResponse['defaultConfigurations']
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasAnyCustomConfig = props.oApp.configurations.some(
    (config) => !config.isDefault,
  )
  const hasDefaultConfig = !hasAnyCustomConfig

  function toggleExpand() {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cx(
        'col-span-full grid-cols-applications-small border-b border-gray-700 py-3.5 text-xs last:rounded-b last:border-none md:min-w-[800px] md:grid-cols-applications',
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
        <span className="flex items-center">
          <BlockchainAddress alwaysShort address={props.oApp.address} />
        </span>
        <span className="flex items-center gap-1.5">
          {props.oApp.configurations
            .map((config) => config.targetChainId)
            .map((chainId) => (
              <BlockchainIcon chainId={chainId} />
            ))}
        </span>
        <span className="flex items-center">
          {hasDefaultConfig ? <DefaultConfigBadge /> : <CustomConfigBadge />}
        </span>

        <button
          className="brightness-100 filter transition-all duration-300 hover:brightness-[120%]"
          onClick={toggleExpand}
        >
          {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 flex flex-col gap-5 rounded bg-gray-750 md:mx-5 md:px-8 md:py-4">
          {props.oApp.configurations.map((config) => (
            <CustomConfig
              key={config.targetChainId.toString()}
              defaults={props.defaults}
              config={config}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CustomConfig(props: {
  config: OAppWithConfigs['configurations'][number]
  defaults: OAppsResponse['defaultConfigurations']
}) {
  const defaultForChain = props.defaults.find(
    (d) => d.targetChainId === props.config.targetChainId,
  )

  if (!defaultForChain) {
    return null
  }

  const squashed = props.config.isDefault
    ? defaultForChain.configuration
    : { ...defaultForChain.configuration, ...props.config.changedConfiguration }

  return (
    <div className="flex flex-col rounded bg-gray-500">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {getPrettyChainName(props.config.targetChainId)}
          {<BlockchainIcon chainId={props.config.targetChainId} />}
        </div>
        <div>
          {props.config.isDefault ? (
            <DefaultConfigBadge />
          ) : (
            <CustomConfigBadge />
          )}
        </div>
      </div>
      <div className="bg-gray-800">
        <R
          label="Relayer"
          currentValue={
            <BlockchainAddress alwaysShort address={squashed.relayer} />
          }
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.relayer && (
              <BlockchainAddress
                alwaysShort
                address={defaultForChain.configuration.relayer}
              />
            )
          }
        />
        <R
          label="Oracle"
          currentValue={
            <BlockchainAddress alwaysShort address={squashed.oracle} />
          }
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.oracle && (
              <BlockchainAddress
                alwaysShort
                address={defaultForChain.configuration.oracle}
              />
            )
          }
        />
        <R
          label="Inbound proof type"
          currentValue={squashed.inboundProofLibraryVersion}
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.inboundProofLibraryVersion &&
            defaultForChain.configuration.inboundProofLibraryVersion
          }
        />
        <R
          label="Inbound block confirmations"
          currentValue={squashed.inboundBlockConfirmations}
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.inboundBlockConfirmations &&
            defaultForChain.configuration.inboundBlockConfirmations
          }
        />
        <R
          label="Outbound proof type"
          currentValue={squashed.outboundProofType}
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.outboundProofType &&
            defaultForChain.configuration.outboundProofType
          }
        />
        <R
          label="Outbound block confirmations"
          currentValue={squashed.outboundBlockConfirmations}
          previousValue={
            !props.config.isDefault &&
            props.config.changedConfiguration.outboundBlockConfirmations &&
            defaultForChain.configuration.outboundBlockConfirmations
          }
        />
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
    <div className="flex h-4 w-4 items-center justify-center rounded ">
      <SimpleArrowIcon className="fill-white" width={10} height={10} />
    </div>
  )
}

function R(props: {
  label: ReactNode
  previousValue?: ReactNode
  currentValue: ReactNode
}) {
  return (
    <Row
      dense
      label={props.label}
      hideBorder
      className={cx('!py-1.5 !pl-5', props.previousValue && 'bg-[#3C3223]')}
      value={
        props.previousValue ? (
          <div className="flex items-center gap-2">
            <span className="opacity-50 filter">{props.previousValue}</span>
            <SolidArrowRight />
            {props.currentValue}
          </div>
        ) : (
          props.currentValue
        )
      }
    />
  )
}
