export function Row<T extends number | string>({
  label,
  value,
}: {
  label: string
  value: T
}) {
  return (
    <div
      className="flex border-y border-black bg-gray-800 px-8 py-3"
      key={label}
    >
      <span className="w-[214px] font-medium text-gray-500">{label}</span>
      <span className="font-mono">{value.toString()}</span>
    </div>
  )
}
