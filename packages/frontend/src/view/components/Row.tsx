export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center md:flex-row">
      <div className="pb-2 pt-1 text-sm font-medium text-gray-15 md:w-1/5">
        {label}
      </div>
      <div className=" pb-2 pt-1 font-mono text-xs md:w-4/5 md:py-4">
        {value}
      </div>
    </div>
  )
}
