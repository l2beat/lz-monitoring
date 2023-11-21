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
    <section className="m-4 mb-10 rounded-lg bg-gray-900 px-4 pb-6 pt-6 md:m-0 md:mb-10 md:p-8">
      <div className="flex flex-col justify-between md:mb-4 md:flex-row">
        <h2 className="mb-4 w-full text-xl md:mb-0">{title}</h2>
        {subtitle && (
          <span className="mb-4 text-2xs text-gray-30 md:mb-0 md:text-md">
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
