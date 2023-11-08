export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-row items-center bg-gray-800 p-3">
      <span className="w-1/5 px-3 font-medium text-gray-500">{label}</span>
      <div className=" w-4/5 overflow-visible p-1 px-2 font-mono text-md md:text-left">
        {value}
      </div>
    </div>
  )
}
