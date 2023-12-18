import cx from 'classnames'

import { LoadingCover } from './status/LoadingCover'

interface Props {
  title: React.ReactNode
  description?: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  isLoading?: boolean
}

export function ProtocolComponentCard({
  title,
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
        <h2 className="mb-4 w-full text-xl md:mb-0">{title}</h2>
        {subtitle && (
          <span className="mb-4 text-ellipsis text-md text-zinc-500 md:mb-0 md:overflow-visible">
            {subtitle}
          </span>
        )}
      </div>
      {description && (
        <div className="text-gray-25 mb-4 text-justify text-xs leading-5 md:mb-6 md:p-0 md:text-md">
          {description}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}
