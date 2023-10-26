import { WarningIcon } from '../icons/WarningIcon'

export function Warning({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="mb-12 bg-gray-900 p-6">
      <div className="flex items-center justify-center gap-3 p-5">
        <div className="w-[45px]">
          <WarningIcon stroke="#FFEA00" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-lg">{title}</span>
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
    </section>
  )
}
