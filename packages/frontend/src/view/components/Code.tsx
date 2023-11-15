import cx from 'classnames'

interface Props {
  children: React.ReactNode
  className?: string
}

export function Code({ children, className }: Props) {
  return (
    <pre
      className={cx(
        'scrollbar-track-gray-300 scrollbar-h-1.5 overflow-auto rounded bg-gray-400 p-3 font-mono text-xs text-gray-500 scrollbar scrollbar-thumb-[#eef36a]',
        className,
      )}
    >
      {children}
    </pre>
  )
}
