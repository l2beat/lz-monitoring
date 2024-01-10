import cx from 'classnames'

export function VersionSwitch(props: { children: React.ReactNode }) {
  return (
    <div className="-mt-10 mb-10 flex items-center justify-center bg-gray-800 p-4">
      <div className="flex gap-5">{props.children}</div>
    </div>
  )
}

export function VersionButton(props: {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
}) {
  const bg = props.isActive ? 'bg-yellow-100' : 'bg-yellow-300'
  return (
    <button
      onClick={props.onClick}
      className={cx(
        'rounded-lg p-3 font-medium text-black filter transition duration-200 ease-in-out hover:brightness-110',
        bg,
      )}
    >
      {props.children}
    </button>
  )
}
