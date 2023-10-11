import cx from 'classnames'

export { Code }

function Code({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
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
