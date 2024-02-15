import {
  isProtocolVersion,
  ProtocolVersion,
} from '../constants/protocol-version'
import { useSerializableQueryParam } from './useSerializableQueryParam'

function serialize(version: ProtocolVersion): string | null {
  if (isProtocolVersion(version)) {
    return version
  }

  return null
}

function deserialize(version: string): ProtocolVersion | null {
  if (isProtocolVersion(version)) {
    return version
  }

  return null
}

export function useVersionQueryParam(
  paramName: string,
  fallback: ProtocolVersion,
) {
  return useSerializableQueryParam({
    paramName,
    fallback,
    serialize,
    deserialize,
  })
}
