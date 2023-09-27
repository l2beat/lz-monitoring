import { ChainId } from '@lz/libs'
import { useEffect, useState } from 'react'

import { useQueryParam } from './useQueryParam'

export { useChainQueryParam }

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
   */
  fallback: ChainId

  /**
   * Key used to store the query param
   */
  paramName: string
}

// We can do that in the generic way such as `useSerializableQueryParam<T>` but it's not needed for now
function useChainQueryParam({
  fallback,
  paramName,
}: UseChainQueryParamOptions) {
  const [currentParam, setCurrentParam] = useQueryParam(paramName)

  const [deserializedParam, setDeserializedParam] = useState<ChainId>(
    currentParam ? deserialize(currentParam) ?? fallback : fallback,
  )

  useEffect(() => {
    setCurrentParam(serialize(deserializedParam))
    // Do we need to add `setCurrentParam` to deps?
  }, [deserializedParam, setCurrentParam])

  return [deserializedParam, setDeserializedParam] as const
}
