import { WarningIcon } from '../icons/WarningIcon'

export function NetworkError() {
  return (
    <section className="mb-12 bg-gray-900 p-6">
      <div className="flex items-center justify-center gap-3 p-5">
        <div className="w-[40px]">
          <WarningIcon stroke="#FFEA00" />
        </div>
        <span className="text-lg">
          Data could not be loaded. Please try again later.
        </span>
      </div>
    </section>
  )
}
