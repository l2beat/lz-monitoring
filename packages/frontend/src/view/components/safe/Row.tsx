export { Row }

function Row({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <div className=" flex bg-gray-800 py-3">
      <span className="w-[20%] px-5 font-medium text-gray-500">{label}</span>
      <span className="w-[80%] overflow-hidden font-mono">{value}</span>
    </div>
  )
}
