export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-0.5 md:flex-row">
      <div className="p-2 text-sm font-medium leading-5 text-gray-15 md:w-1/5 md:p-0">
        {label}
      </div>
      <div className="p-2 font-mono text-3xs md:w-4/5 md:p-0 md:py-4 md:text-sm">
        {value}
      </div>
    </div>
  )
}
