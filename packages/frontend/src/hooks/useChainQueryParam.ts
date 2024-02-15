import { ChainId } from '@lz/libs'

import { useSerializableQueryParam } from './useSerializableQueryParam'

function serialize(chainId: ChainId): string | null {
  try {
    return ChainId.getName(chainId)
  } catch (error) {
    return null
  }
}

function deserialize(value: string): ChainId | null {
  try {
    return ChainId.fromName(value)
  } catch (error) {
    return null
  }
}

export function useSafeChainQueryParam(paramName: string, fallback: ChainId) {
  return useSerializableQueryParam({
    paramName,
    fallback,
    serialize,
    deserialize,
  })
}

export function useChainQueryParam(paramName: string) {
  return useSerializableQueryParam({
    paramName,
    serialize,
    deserialize,
    fallback: undefined,
  })
}
