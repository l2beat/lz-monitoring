import cx from 'classnames'

export function SubsectionHeader(props: {
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={cx('mb-3 mt-10 flex justify-between', props.className)}>
      <span className="text-lg font-medium">{props.title}</span>
      {props.subtitle && (
        <span className="text-md text-[#807c70]">{props.subtitle}</span>
      )}
    </div>
  )
}
