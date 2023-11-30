import { WarningIcon } from '../icons/WarningIcon'

export function Warning({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="mb-12 p-6">
      <div className="flex items-center justify-center gap-3 p-5">
        <div className="w-[45px]">
          <WarningIcon className="stroke-yellow-100" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg">{title}</span>
          {subtitle && <span className="text-sm text-gray-15">{subtitle}</span>}
        </div>
      </div>
    </section>
  )
}
