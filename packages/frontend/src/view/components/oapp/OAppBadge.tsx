import cx from 'classnames'

import { Tooltip } from '../Tooltip'

export function DefaultConfigBadge() {
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

export function CustomConfigBadge() {
  return (
    <Tooltip
      text="This application has changed its configuration."
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

export function UnknownConfigBadge() {
  return (
    <Tooltip
      text="No remote chain configuration has been discovered. Site only supports 10 EVM chains at the moment."
      variant="text"
    >
      <div
        className={cx(
          'flex h-[22px] max-w-fit items-center justify-center rounded bg-[#494844] px-2 text-2xs',
        )}
      >
        UNKNOWN
      </div>
    </Tooltip>
  )
}
