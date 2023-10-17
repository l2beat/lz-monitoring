import { AccentColor, ProtocolComponentCard } from './ProtocolComponentCard'

export function cardFor(title: string, accentColor: AccentColor) {
  return (props: {
    children?: React.ReactNode
    subtitle?: React.ReactNode
  }) => (
    <ProtocolComponentCard title={title} accentColor={accentColor} {...props} />
  )
}
