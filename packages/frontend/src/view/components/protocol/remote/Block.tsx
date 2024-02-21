export function Block({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col border-t border-zinc-400 px-3 py-4 md:px-6 md:py-3">
      <span className="mb-1 text-sm font-medium md:mb-3">{title}</span>
      <div className="flex flex-col md:gap-2">{children}</div>
    </div>
  )
}
