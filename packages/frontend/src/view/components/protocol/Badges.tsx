import cx from 'classnames'

import { Tooltip } from '../Tooltip'

export function UpdatableBadge(props: { className?: string }) {
  return (
    <Badge
      className={props.className}
      color={'green'}
      label={'Updatable'}
      tooltipText="This contract's code is immutable. However, important parameters can be changed by updating the storage that acts as a configuration."
    />
  )
}

export function GnosisSafeBadge(props: { className?: string }) {
  return (
    <Badge
      className={props.className}
      color={'blue'}
      label={'GnosisSafe proxy'}
      tooltipText="The contract is a proxy to a GnosisSafe multisig."
    />
  )
}

function Badge(props: {
  className?: string
  color: 'green' | 'blue'
  label: string
  tooltipText: string
}) {
  const colorClasses =
    props.color === 'green'
      ? 'border-green-400 text-green-400'
      : 'border-blue-400 text-blue-400'
  return (
    <Tooltip text={props.tooltipText} variant="text">
      <span
        className={cx(
          'inline-flex cursor-default items-center rounded border px-2 py-1 text-xs font-medium',
          colorClasses,
          props.className,
        )}
      >
        {props.label}
      </span>
    </Tooltip>
  )
}
