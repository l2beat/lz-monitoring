export function Subsection({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 flex flex-col rounded-lg bg-gray-800 md:px-6">
      {children}
    </div>
  )
}
