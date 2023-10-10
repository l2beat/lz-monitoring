export { CodeRow }

function CodeRow(props: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex bg-gray-800 py-3" key={props.label}>
      <div className="flex w-[20%] items-center px-5 font-medium text-gray-500">
        {props.label}
      </div>
      <pre className="w-[80%] grow overflow-auto bg-gray-900 p-6 font-mono text-gray-500">
        {props.children}
      </pre>
    </div>
  )
}
