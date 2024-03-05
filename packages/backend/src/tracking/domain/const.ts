export { ProtocolVersion }

const ProtocolVersion = {
  'V1': 'V1',
  'V2': 'V2',
} as const

type ProtocolVersion = (typeof ProtocolVersion)[keyof typeof ProtocolVersion]
