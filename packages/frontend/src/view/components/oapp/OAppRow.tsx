import {
  ChainId,
  getPrettyChainName,
  OAppsResponse,
  OAppWithConfigs,
} from '@lz/libs'
import cx from 'classnames'
import { useState } from 'react'

import { SolidMinusIcon } from '../../icons/MinusIcon'
import { SolidPlusIcon } from '../../icons/PlusIcon'
import { BlockchainAddress } from '../BlockchainAddress'
import { BlockchainIcon } from '../BlockchainIcon'
import { InfoTooltip } from '../InfoTooltip'
import {
  CustomConfigBadge,
  DefaultConfigBadge,
  UnknownConfigBadge,
} from './OAppBadge'
import { OAppConfig } from './OAppConfig'

export function OAppRow(props: {
  oApp: OAppWithConfigs
  sourceChain: ChainId
  defaults: OAppsResponse['defaultConfigurations']
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasAnyConfig = props.oApp.configurations.length > 0
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
          {hasAnyConfig ? (
            props.oApp.configurations
              .map((config) => config.targetChainId)
              .map((chainId) => <BlockchainIcon chainId={chainId} />)
          ) : (
            <InfoTooltip text="OApp can be used with other chains if they are any configured, however they are not supported by this site at the moment.">
              <span className="font-mono tracking-tight text-gray-100">
                No pathways discovered
              </span>
            </InfoTooltip>
          )}
        </span>
        <span className="flex items-center">
          {!hasAnyConfig ? (
            <UnknownConfigBadge />
          ) : hasDefaultConfig ? (
            <DefaultConfigBadge />
          ) : (
            <CustomConfigBadge />
          )}
        </span>

        {hasAnyConfig && (
          <button
            className="brightness-100 filter transition-all duration-300 hover:brightness-[120%]"
            onClick={toggleExpand}
          >
            {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 flex flex-col gap-3 rounded bg-gray-750 md:mx-5 md:px-8 md:py-3">
          {props.oApp.configurations.map((config) => (
            <OAppConfig
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
