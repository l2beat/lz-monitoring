export { Code }

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="grow overflow-auto border border-gray-700 bg-gray-900 p-10 font-mono text-gray-500">
      {children}
    </pre>
  )
}
