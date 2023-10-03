import { DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import { capitalizeFirstLetter } from './statusUtils'

export function StateHighlight(props: { state: DiscoveryStatus['state'] }) {
  const stateColor =
    props.state === 'enabled' ? 'text-[#63f542]' : 'text-[#f5c842]'
  return (
    <div className={cx('text- font-medium', stateColor)}>
      {capitalizeFirstLetter(props.state)}
    </div>
  )
}
