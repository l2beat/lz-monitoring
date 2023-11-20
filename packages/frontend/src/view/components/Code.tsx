import cx from 'classnames'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Code({ children, className }: Props) {
  return (
    <pre
      className={cx(
        'scrollbar-h-1.5 text-gray-15 overflow-auto rounded bg-gray-200 p-3 font-mono text-xs scrollbar scrollbar-track-gray-50 scrollbar-thumb-[#eef36a]',
        className,
      )}
    >
      {children}
    </pre>
  )
}
