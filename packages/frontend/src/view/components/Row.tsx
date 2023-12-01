import cx from 'classnames'

interface Style {
  hideBorder?: boolean
  className?: string
  dense?: boolean
}

interface Values {
  label: React.ReactNode
  value: React.ReactNode
}

type Props = Style & Values

export function Row(props: Props) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center py-0.5 md:flex-row',
        !props.hideBorder && 'border-b border-gray-700 last:border-none',
        props.className,
      )}
    >
      <RowLabel dense={props.dense}>{props.label}</RowLabel>
      <RowValue dense={props.dense}>{props.value}</RowValue>
    </div>
  )
}

export function RowLabel({
  children,
  dense,
}: {
  children: React.ReactNode
  dense?: boolean
}) {
  const widthRation = dense ? 'md:w-[30%]' : 'md:w-1/5'

  return (
    <div
      className={cx(
        'py-2 pr-2 text-sm font-medium leading-5 text-gray-100 md:w-1/5 md:py-0',
        widthRation,
      )}
    >
      {children}
    </div>
  )
}

export function RowValue({
  children,
  dense,
}: {
  children: React.ReactNode
  dense?: boolean
}) {
  const widthRation = dense ? 'md:w-[70%]' : 'md:w-4/5'
  const padding = dense ? 'md:py-1.5' : 'md:py-4 md:px-0'

  return (
    <div
      className={cx(
        'w-full text-ellipsis pb-2 text-center font-mono text-3xs md:text-left md:text-sm',
        widthRation,
        padding,
      )}
    >
      {children}
    </div>
  )
}
