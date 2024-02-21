import cx from 'classnames'

import {
  PROTOCOL_VERSION,
  ProtocolVersion,
} from '../../../constants/protocol-version'
import { PillSelector } from './Pill'

interface Props {
  version: ProtocolVersion
  setVersion: (version: ProtocolVersion) => void

  isSmall: boolean
}

export function VersionSelector(props: Props) {
  const versions = Object.values(PROTOCOL_VERSION)

  return (
    <>
      <span
        className={cx(
          'block overflow-hidden text-xs text-gray-100 transition-all',
          props.isSmall ? 'max-h-0' : 'max-h-3.5',
        )}
      >
        Select version
      </span>
      <div
        className={cx(
          'flex gap-3 py-1',
          props.isSmall ? 'm-0' : 'mb-1.5 mt-0.5',
        )}
      >
        {versions.map((version) => {
          return (
            <PillSelector
              key={version}
              label={version}
              isSmall={props.isSmall}
              isActive={version === props.version}
              onClick={() => props.setVersion(version)}
            />
          )
        })}
      </div>
    </>
  )
}
