import { DiscoveryStatus } from '@lz/libs'

import { capitalizeFirstLetter } from './statusUtils'

export function StateHighlight(props: {
  state: DiscoveryStatus['state']
  visibility: DiscoveryStatus['visible']
}) {
  const stateColor =
    props.state === 'enabled' ? 'text-[#63f542]' : 'text-[#f5c842]'

  const visibilityText = props.visibility ? 'Visible' : 'Hidden'
  const visibilityTextColor = props.visibility
    ? 'text-[#63f542]'
    : 'text-[#f5c842]'

  return (
    <div className="flex flex-col gap-1 font-medium">
      <div>
        <span>⚙️ Module: </span>
        <span className={stateColor}>{capitalizeFirstLetter(props.state)}</span>
      </div>
      <div>
        <span>👁️ Visibility: </span>
        <span className={visibilityTextColor}>{visibilityText}</span>
      </div>
    </div>
  )
}
