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
    <section className={cx('mb-6 rounded-lg bg-gray-200 p-3 md:p-8')}>
      <div className="mb-3 flex flex-col items-center justify-between gap-2 md:mb-6 md:flex-row">
        <h2 className={cx('text-xl')}>{title}</h2>
        {subtitle && (
          <span className="font-mono text-[12px] text-gray-600 md:text-md">
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
