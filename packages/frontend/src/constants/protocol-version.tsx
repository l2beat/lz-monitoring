export const PROTOCOL_VERSION = {
  V1: 'V1',
  V2: 'V2',
} as const

export type ProtocolVersion =
  (typeof PROTOCOL_VERSION)[keyof typeof PROTOCOL_VERSION]

export function isProtocolVersion(version: string): version is ProtocolVersion {
  return Object.values(PROTOCOL_VERSION).includes(version as ProtocolVersion)
}
