import cx from 'classnames'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Code({ children, className }: Props) {
  return (
    <pre
      className={cx(
        'w-full overflow-x-auto bg-gray-500 p-3 text-left font-mono text-xs text-gray-100 scrollbar scrollbar-track-gray-400 scrollbar-thumb-yellow-100 md:rounded',
        className,
      )}
    >
      {children}
    </pre>
  )
}
