import { ChainId } from '@lz/libs'
import { useEffect, useState } from 'react'

import { useQueryParam } from './useQueryParam'

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

interface UseChainQueryParamOptions {
  /**
   * Chain ID to use if the query param is not set
   * If not set, value will be nullable
   */
  fallback?: ChainId

  /**
   * Key used to store the query param
   */
  paramName: string
}

// We can do that in the generic way such as `useSerializableQueryParam<T>` but it's not needed for now
export function useChainQueryParam<Params extends UseChainQueryParamOptions>({
  fallback,
  paramName,
}: Params) {
  const [currentParam, setCurrentParam] = useQueryParam(paramName)

  const actualFallback = fallback ?? null

  // Deserialize string into ChainId if present
  // Otherwise persist null/fallback
  const param = currentParam
    ? deserialize(currentParam) ?? actualFallback
    : actualFallback

  const [deserializedParam, setDeserializedParam] = useState<ChainId | null>(
    param,
  )

  useEffect(() => {
    setCurrentParam(deserializedParam ? serialize(deserializedParam) : null)
  }, [deserializedParam, setCurrentParam])

  return [
    deserializedParam,
    setDeserializedParam,
  ] as Params['fallback'] extends ChainId
    ? [ChainId, React.Dispatch<React.SetStateAction<ChainId>>]
    : [ChainId | null, React.Dispatch<React.SetStateAction<ChainId | null>>]
}
