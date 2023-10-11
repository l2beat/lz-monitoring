export function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center  justify-center bg-gray-800 py-3 align-middle">
      <span className="w-1/5 px-5 font-medium text-gray-500">{label}</span>
      <span className="w-4/5 overflow-hidden font-mono">{value}</span>
    </div>
  )
}
