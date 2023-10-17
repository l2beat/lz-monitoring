import cx from 'classnames'

interface Props {
  children?: React.ReactNode
  subtitle?: React.ReactNode
  title: React.ReactNode
  accentColor: AccentColor
}

export function ProtocolComponentCard({
  title,
  accentColor,
  children,
  subtitle,
}: Props) {
  const borderColor = accentToBorderColor(accentColor)
  const textColor = accentToTextColor(accentColor)

  return (
    <section className={cx('mx-6 mb-12 border-t bg-gray-900', borderColor)}>
      <div className="flex items-center justify-between p-8">
        <h2 className={cx('text-2xl text-lg font-medium', textColor)}>
          {title}
        </h2>
        {subtitle && (
          <span className="p-2 font-mono text-[12px] text-gray-600 md:p-0 md:text-md">
            {subtitle}
          </span>
        )}
      </div>
      <div>{children}</div>
    </section>
  )
}

type AccentColor = 'green' | 'blue' | 'orange' | 'deep-blue'

function accentToBorderColor(color: AccentColor): string {
  switch (color) {
    case 'green':
      return 'border-green'
    case 'blue':
      return 'border-blue'
    case 'orange':
      return 'border-orange'
    case 'deep-blue':
      return 'border-[#3cb1ff]'
  }
}

function accentToTextColor(color: AccentColor): string {
  switch (color) {
    case 'green':
      return 'text-green'
    case 'blue':
      return 'text-blue'
    case 'orange':
      return 'text-orange'
    case 'deep-blue':
      return 'text-[#3cb1ff]'
  }
}
