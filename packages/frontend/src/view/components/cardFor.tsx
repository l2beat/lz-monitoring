import { AccentColor, ProtocolComponentCard } from './ProtocolComponentCard'

export function cardFor(title: string, accentColor: AccentColor) {
  return (props: {
    subtitle?: React.ReactNode
    children?: React.ReactNode
  }) => (
    <ProtocolComponentCard title={title} accentColor={accentColor} {...props} />
  )
}
