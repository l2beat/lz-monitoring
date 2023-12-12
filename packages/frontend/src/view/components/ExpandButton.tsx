import cx from 'classnames'

import { SolidMinusIcon } from '../icons/MinusIcon'
import { SolidPlusIcon } from '../icons/PlusIcon'

export function ExpandButton({
  isExpanded,
  onClick,
  classNames,
}: {
  isExpanded: boolean
  onClick: () => void
  classNames?: string
}) {
  return (
    <button
      className={cx(
        'brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        classNames,
      )}
      onClick={onClick}
    >
      {isExpanded ? <SolidMinusIcon /> : <SolidPlusIcon />}
    </button>
  )
}
