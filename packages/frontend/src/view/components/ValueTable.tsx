import cx from 'classnames'

export function ValueTable(props: {
  title: React.ReactNode
  colsClass: string
  headers: React.ReactNode[]
  rows: React.ReactNode[]
}) {
  const gridClassName = `${props.colsClass} grid col-span-full`
  function Header() {
    return (
      <div
        className={cx(
          'bg-zinc-650 py-3 text-center text-3xs font-semibold text-zinc-200 md:text-2xs',
          gridClassName,
        )}
      >
        {props.headers.map((header) => (
          <span>{header}</span>
        ))}
      </div>
    )
  }

  function Row(props: { row: React.ReactNode }) {
    return (
      <div
        className={cx(
          'items-center justify-center border-b border-zinc-650 py-2 text-center text-xs last:border-none',
          gridClassName,
        )}
      >
        {props.row}
      </div>
    )
  }

  return (
    <Block title={props.title}>
      <div
        className={cx(
          'mt-2 w-full overflow-x-auto rounded border border-zinc-650 md:min-w-[800px]',
          gridClassName,
        )}
      >
        <Header />

        <div
          className={cx(
            'max-h-[450px] overflow-y-auto scrollbar scrollbar-track-gray-400 scrollbar-thumb-yellow-100',
            gridClassName,
          )}
        >
          {props.rows.map((row) => (
            <Row row={row} />
          ))}
        </div>
      </div>
    </Block>
  )
}

function Block({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-t border-zinc-400 px-3 py-4 md:px-6 md:py-3">
      <span className="mb-1 text-sm font-medium md:mb-3">{title}</span>
      <div className="flex flex-col md:gap-2">{children}</div>
    </div>
  )
}
