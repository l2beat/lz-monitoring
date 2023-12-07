import { InfoIcon } from '../icons/InfoIcon'

export function Info({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <section className="p-2">
      <div className="flex items-center justify-center gap-3 p-5">
        <div className="w-[45px]">
          <InfoIcon fill="#3db6bc" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm leading-4 md:text-lg">{title}</span>
          {subtitle && (
            <span className="text-2xs leading-4 text-gray-100 md:text-sm">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
