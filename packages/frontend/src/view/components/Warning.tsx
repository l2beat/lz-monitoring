import { WarningIcon } from '../icons/WarningIcon'

export function Warning({
  title,
  subtitle,
  slim = false,
}: {
  title: string
  subtitle?: string
  slim?: boolean
}) {
  const padding = slim ? 'p-0 mb-0' : 'p-5 m-12'
  return (
    <section className={padding}>
      <div className="flex items-center justify-center gap-3 p-5">
        <div className="w-[45px]">
          <WarningIcon className="stroke-yellow-100" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-5 md:text-lg md:leading-4">
            {title}
          </span>

          {subtitle && (
            <span className="text-2xs text-gray-100 md:text-sm">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
