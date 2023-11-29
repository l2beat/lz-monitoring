import cx from 'classnames'

interface Style {
  hideBorder?: boolean
  className?: string
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
        !props.hideBorder && 'border-b border-gray-400 last:border-none',
        props.className,
      )}
    >
      <RowLabel>{props.label}</RowLabel>
      <RowValue>{props.value}</RowValue>
    </div>
  )
}

export function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-2 pr-2 text-sm font-medium leading-5 text-gray-15 md:w-1/5 md:py-0">
      {children}
    </div>
  )
}

export function RowValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full text-ellipsis pb-2 text-center font-mono text-3xs md:w-4/5 md:px-0 md:py-4 md:text-left md:text-sm">
      {children}
    </div>
  )
}
