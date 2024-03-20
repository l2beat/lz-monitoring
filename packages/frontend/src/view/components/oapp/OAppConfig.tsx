import { getPrettyChainName, OAppsResponse, OAppWithConfigs } from '@lz/libs'
import cx from 'classnames'
import { ReactNode, useState } from 'react'

import { SolidMinusIcon } from '../../icons/MinusIcon'
import { SolidPlusIcon } from '../../icons/PlusIcon'
import { SimpleArrowIcon } from '../../icons/SimpleArrowIcon'
import { BlockchainAddress } from '../BlockchainAddress'
import { BlockchainIcon } from '../BlockchainIcon'
import { InfoTooltip } from '../InfoTooltip'
import { Row } from '../Row'
import { CustomConfigBadge, DefaultConfigBadge } from './OAppBadge'

type OAppConfig =
  OAppsResponse['defaultConfigurations'][number]['configuration']

export function OAppConfig(props: {
  config: OAppWithConfigs['configurations'][number]
  defaults: OAppsResponse['defaultConfigurations']
}) {
  const [isExpanded, setIsExpanded] = useState(!props.config.isDefault)

  const defaultForChain = props.defaults.find(
    (d) => d.targetChainId === props.config.targetChainId,
  )

  if (!defaultForChain) {
    return null
  }

  function toggleExpand() {
    setIsExpanded(!isExpanded)
  }

  const remap = createRemapping(props.config, defaultForChain.configuration)

  const relayer = remap('relayer')
  const oracle = remap('oracle')
  const iplv = remap('inboundProofLibraryVersion')
  const ibc = remap('inboundBlockConfirmations')
  const opt = remap('outboundProofType')
  const obc = remap('outboundBlockConfirmations')

  return (
    <div className="flex flex-col rounded bg-gray-500">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {getPrettyChainName(props.config.targetChainId)}
          {<BlockchainIcon chainId={props.config.targetChainId} />}
        </div>
        <div className="flex items-center justify-center gap-5">
          <div>
            {props.config.isDefault ? (
              <DefaultConfigBadge />
            ) : (
              <CustomConfigBadge />
            )}
          </div>
          <div>
            <button
              className="brightness-100 filter transition-all duration-300 hover:brightness-[120%]"
              onClick={toggleExpand}
            >
              {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="bg-gray-800">
          <ConfigProperty
            label={
              <InfoTooltip text="Works in tandem with an Oracle to transmit messages between chains. Relayer proves the message inclusion in the source chain to the destination chain.">
                Relayer
              </InfoTooltip>
            }
            currentValue={
              <BlockchainAddress alwaysShort address={relayer.currentValue} />
            }
            previousValue={
              relayer.previousValue && (
                <BlockchainAddress
                  alwaysShort
                  address={relayer.previousValue}
                />
              )
            }
          />
          <ConfigProperty
            label={
              <InfoTooltip text="An address allowed to advance a block header. The oracle moves a requested block header from a source chain to a destination chain. It writes a commitment for the messages on the destination chain.">
                Oracle
              </InfoTooltip>
            }
            currentValue={
              <BlockchainAddress alwaysShort address={oracle.currentValue} />
            }
            previousValue={
              oracle.previousValue && (
                <BlockchainAddress alwaysShort address={oracle.previousValue} />
              )
            }
          />
          <ConfigProperty
            label={
              <InfoTooltip text="The proof library used to decode and verify received proofs.">
                Inbound proof library
              </InfoTooltip>
            }
            currentValue={iplv.currentValue}
            previousValue={iplv.previousValue}
          />
          <ConfigProperty
            label={
              <InfoTooltip text="The number of block confirmations on the source chain for inbound messages. Serves the purpose of a reorg protection.">
                Inbound proof confirmations
              </InfoTooltip>
            }
            currentValue={ibc.currentValue}
            previousValue={ibc.previousValue}
          />
          <ConfigProperty
            label={
              <InfoTooltip text="The proof library used to encode outbound messages and create proofs.">
                Outbound proof type
              </InfoTooltip>
            }
            currentValue={opt.currentValue}
            previousValue={opt.previousValue}
          />
          <ConfigProperty
            label={
              <InfoTooltip text="The number of block confirmations for outbound messages. Serves the purpose of a reorg protection.">
                Outbound block confirmations
              </InfoTooltip>
            }
            currentValue={obc.currentValue}
            previousValue={obc.previousValue}
          />
        </div>
      )}
    </div>
  )
}

function ConfigProperty(props: {
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

function SolidArrowRight() {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded ">
      <SimpleArrowIcon className="fill-white" width={10} height={10} />
    </div>
  )
}

/**
 * Squashes default configuration with the current configuration.
 * `previousValue` is set to undefined if the configuration key is default.
 */
function createRemapping(
  currentConfiguration: OAppWithConfigs['configurations'][number],
  defaultConfiguration: OAppConfig,
) {
  return function <Key extends keyof OAppConfig>(key: Key) {
    const defaultValue = defaultConfiguration[key]
    const changedValue =
      !currentConfiguration.isDefault &&
      currentConfiguration.changedConfiguration[key]

    if (currentConfiguration.isDefault || !changedValue) {
      return {
        currentValue: defaultValue,
        previousValue: undefined,
      }
    }

    return {
      currentValue: changedValue,
      previousValue: defaultValue,
    }
  }
}
