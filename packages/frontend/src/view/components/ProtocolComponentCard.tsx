import cx from 'classnames'

import { LoadingCover } from './status/LoadingCover'

interface Props {
  title: React.ReactNode
  badge: React.ReactNode
  description?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  isLoading?: boolean
}

export function ProtocolComponentCard({
  title,
  badge,
  children,
  subtitle,
  description,
  className,
  isLoading,
}: Props) {
  return (
    <section
      className={cx(
        'relative m-4 rounded-lg bg-gray-900 px-5 py-6 md:m-0 md:mb-10 md:p-8',
        className,
      )}
    >
      {isLoading && <LoadingCover />}

      <div className="flex flex-col justify-between md:mb-4 md:flex-row">
        <div className="mb-4 flex items-center gap-4 md:mb-0">
          <h2 className="text-xl">{title}</h2>
          <div>{badge}</div>
        </div>
        {subtitle && (
          <span className="mb-4 text-ellipsis text-2xs text-zinc-500 md:mb-0 md:overflow-visible md:text-md">
            {subtitle}
          </span>
        )}
      </div>
      {description && (
        <div className="mb-4 text-justify text-sm leading-5 md:mb-6 md:p-0">
          {description}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}
