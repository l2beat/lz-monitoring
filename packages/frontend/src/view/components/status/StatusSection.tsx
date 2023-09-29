import { DiscoveryEnabledStatus, DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import {
  capitalizeFirstLetter,
  getOverallHealth,
  healthToBorder,
} from './statusUtils'

interface Props {
  status: DiscoveryStatus
}

export function StatusSection(props: Props) {
  const moduleHealth = getOverallHealth(props.status)
  const borderColor = healthToBorder(moduleHealth)

  return (
    <section className={cx('mb-12 border-t bg-gray-900 p-6', borderColor)}>
      {typeof moduleHealth !== 'string' && (
        <div className="pb-5">
          {moduleHealth.warnings.map((warning) => (
            <div className="text-[#F5C842]">⚠️ {warning}</div>
          ))}
        </div>
      )}
      <div className="w-100 mb-6 flex justify-between">
        <div className="text-xxl font-medium">
          {capitalizeFirstLetter(props.status.chainName)}
          <ChainHighlight chain={props.status.chainId} />
        </div>
        <StateHighlight state={props.status.state} />
      </div>
      <div>
        <LastIndexedBlock block={props.status.lastIndexedBlock} />
        <LastDiscoveredBlock blockNumber={props.status.lastDiscoveredBlock} />
        <LatestIndexerStates indexerStates={props.status.indexerStates} />
        {props.status.state === 'enabled' ? (
          <Delays delays={props.status.delays} />
        ) : (
          <SubsectionHeader title="Delays" subtitle="Module is offline" />
        )}

        {props.status.state === 'enabled' ? (
          <NodeInformation nodeInfo={props.status.node} />
        ) : (
          <SubsectionHeader
            title="Node information"
            subtitle="Module is offline"
          />
        )}
      </div>
    </section>
  )
}

function StateHighlight(props: { state: DiscoveryStatus['state'] }) {
  const stateColor =
    props.state === 'enabled' ? 'text-[#63f542]' : 'text-[#f5c842]'
  return (
    <div className={cx('text- font-medium', stateColor)}>
      {capitalizeFirstLetter(props.state)}
    </div>
  )
}

function LastIndexedBlock({
  block,
}: {
  block: DiscoveryStatus['lastIndexedBlock']
}) {
  if (!block) {
    return (
      <SubsectionHeader title="Last indexed block" subtitle="Data is missing" />
    )
  }

  const prettyTimestamp = `${block.timestamp.toNumber()} / ${block.timestamp
    .toDate()
    .toUTCString()}`

  const timestampDiff = Date.now() / 1000 - block.timestamp.toNumber()

  const prettyTimestampDiff = `${timestampDiff.toFixed(0)} seconds ago`

  return (
    <div>
      <SubsectionHeader title="Last indexed block" />
      <Row label="Block Number" value={block.blockNumber} />
      <Row label="Block Hash" value={block.blockHash.toString()} />
      <Row label="Timestamp" value={prettyTimestamp} />
      <Row label="Time elapsed from now" value={prettyTimestampDiff} />
    </div>
  )
}

function LastDiscoveredBlock({ blockNumber }: { blockNumber: number | null }) {
  if (!blockNumber) {
    return (
      <SubsectionHeader
        title="Last Discovered block"
        subtitle="Data is missing"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Last Discovered Block" />
      <Row label="Last discovered block" value={blockNumber} />
    </>
  )
}

function LatestIndexerStates({
  indexerStates,
}: {
  indexerStates: DiscoveryStatus['indexerStates']
}) {
  if (indexerStates.length === 0) {
    return (
      <SubsectionHeader
        title="Latest indexer states"
        subtitle="Data is missing"
      />
    )
  }

  return (
    <>
      <SubsectionHeader title="Latest indexer states" />
      {indexerStates.map((state) => {
        const prettyTimestamp = `${state.height} / ${new Date(
          state.height * 1000,
        ).toUTCString()}`
        return <Row label={state.id} value={prettyTimestamp} />
      })}
    </>
  )
}

function Delays({
  delays: { blocks, offset, discovery },
}: {
  delays: DiscoveryEnabledStatus['delays']
}) {
  const hasData = blocks && offset && discovery

  if (!hasData) {
    return <SubsectionHeader title="Delays" subtitle="Data is missing" />
  }

  return (
    <div>
      <SubsectionHeader title="Delays" />
      {blocks && <Row label="Blocks behind the tip" value={blocks} />}
      {discovery && <Row label="Discovery blocks to tip" value={discovery} />}
      {offset && <Row label="Offset between indexers" value={offset} />}
    </div>
  )
}

function NodeInformation({
  nodeInfo,
}: {
  nodeInfo: DiscoveryEnabledStatus['node'] | null
}) {
  if (!nodeInfo) {
    return (
      <SubsectionHeader title="Node information" subtitle="Data is missing" />
    )
  }

  const prettyTimestamp = `${nodeInfo.blockTimestamp} / ${new Date(
    nodeInfo.blockTimestamp * 1000,
  ).toUTCString()}`

  return (
    <div>
      <SubsectionHeader title="Node information" />
      <Row label="Node latest block" value={nodeInfo.blockNumber} />
      <Row label="Node latest timestamp" value={prettyTimestamp} />
    </div>
  )
}

function Row<T extends number | string>({
  label,
  value,
}: {
  label: string
  value: T
}) {
  return (
    <div
      className="flex border-y border-black bg-gray-800 px-8 py-3"
      key={label}
    >
      <span className="w-[214px] font-medium text-gray-500">{label}</span>
      <span className="font-mono">{value.toString()}</span>
    </div>
  )
}

function ChainHighlight(props: { chain: DiscoveryStatus['chainId'] }) {
  const chainId = props.chain.valueOf()

  return <span className={cx('p-2 text-md text-[#807c70]')}>ID: {chainId}</span>
}

function SubsectionHeader(props: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cx('mb-3 mt-10 flex justify-between', props.className)}>
      <span className="text-lg font-medium">{props.title}</span>
      {props.subtitle && (
        <span className="text-md text-[#807c70]">{props.subtitle}</span>
      )}
    </div>
  )
}
