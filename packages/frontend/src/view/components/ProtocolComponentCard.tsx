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
    <section className="mb-6 rounded-lg bg-gray-900 p-3 pt-8 md:p-8">
      <div className="flex flex-col items-center justify-between gap-2 md:mb-6 md:flex-row">
        <h2 className="text-xl">{title}</h2>
        {subtitle && (
          <span className="text-gray-30 font-mono text-[12px] md:text-md">
            {subtitle}
          </span>
        )}
      </div>
      {description && (
        <div className="mb-1 p-4 text-justify text-sm leading-5 md:mb-6 md:p-0">
          {description}
        </div>
      )}
      <div>{children}</div>
    </section>
  )
}
