export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-row items-center">
      <span className="w-1/5 py-2 text-sm font-medium text-gray-500">
        {label}
      </span>
      <div className=" w-4/5 overflow-visible py-4 font-mono text-xs">
        {value}
      </div>
    </div>
  )
}
