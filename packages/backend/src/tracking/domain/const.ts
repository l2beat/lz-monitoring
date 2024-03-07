export { ProtocolVersion, toProtocolVersion }

const ProtocolVersion = {
  V1: 'V1',
  V2: 'V2',
} as const

type ProtocolVersion = (typeof ProtocolVersion)[keyof typeof ProtocolVersion]

function toProtocolVersion(version: string): ProtocolVersion {
  switch (version) {
    case 'V1':
      return ProtocolVersion.V1
    case 'V2':
      return ProtocolVersion.V2
    default:
      throw new Error(`Unknown protocol version ${version}`)
  }
}
