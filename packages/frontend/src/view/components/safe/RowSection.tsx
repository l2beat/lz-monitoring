export { RowSection }

function RowSection({ children }: { children: React.ReactNode[] }) {
  return (
    <div className="mb-10 flex flex-col gap-[1px] bg-black">{children}</div>
  )
}
