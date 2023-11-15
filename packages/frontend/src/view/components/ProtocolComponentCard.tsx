import cx from 'classnames'

interface Props {
  title: React.ReactNode
  description?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
}

export function ProtocolComponentCard({
  title,
  children,
  subtitle,
  description,
}: Props) {
  return (
    <section className={cx('mb-6 rounded-lg bg-gray-200 p-8')}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className={cx('text-font-medium text-xl')}>{title}</h2>
        {subtitle && (
          <span className="p-0 font-mono text-[12px] text-md text-gray-600">
            {subtitle}
          </span>
        )}
      </div>
      {description && (
        <div className="mb-6 text-justify text-sm leading-5">{description}</div>
      )}
      <div>{children}</div>
    </section>
  )
}
