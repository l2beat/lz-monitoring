export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col items-center bg-gray-800 px-2 py-3 md:flex-row md:px-8">
      <span className="w-full text-center font-medium text-gray-500 md:w-1/5 md:text-left">
        {label}
      </span>
      <div className="w-full p-1 text-center font-mono text-[12px] md:w-4/5 md:overflow-visible md:p-0 md:text-left md:text-md">
        {value}
      </div>
    </div>
  )
}
