import cx from 'classnames'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Code({ children, className }: Props) {
  return (
    <pre
      className={cx(
        'overflow-auto border border-gray-700 bg-gray-900 p-10 font-mono text-gray-500',
        className,
      )}
    >
      {children}
    </pre>
  )
}
