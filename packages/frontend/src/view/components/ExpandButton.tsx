import cx from 'classnames'

import { MinusIcon } from '../icons/MinusIcon'
import { PlusIcon } from '../icons/PlusIcon'

export function ExpandButton({
  isExpanded,
  onClick,
  small,
  classNames,
}: {
  isExpanded: boolean
  onClick: () => void
  small?: boolean
  classNames?: string
}) {
  const size = small ? 'w-[18px] h-[18px]' : 'w-[22px] h-[22px]'
  const stroke = small ? 'none' : 'black'

  return (
    <button
      className={cx(
        'flex items-center justify-center rounded-sm bg-yellow-100 brightness-100 filter transition-all duration-300 hover:brightness-[120%]',
        classNames,
        size,
      )}
      onClick={onClick}
    >
      {isExpanded ? (
        <MinusIcon stroke={stroke} />
      ) : (
        <PlusIcon stroke={stroke} />
      )}
    </button>
  )
}
