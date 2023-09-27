import { ChainId } from '@lz/libs'
import { useEffect, useState } from 'react'

import { useQueryParam } from './useQueryParams'

export { useChainQueryParam }

const paramName = 'chain'
function serialize(chainId: ChainId): string | null {
  try {
    return ChainId.getName(chainId)
  } catch (error) {
    return null
  }
}

const fallback = ChainId.ETHEREUM

function deserialize(value: string): ChainId | null {
  try {
    return ChainId.fromName(value)
  } catch (error) {
    return null
  }
}

// We can do that in the generic way such as `useSerializableQueryParam<T>` but it's not needed for now
function useChainQueryParam() {
  const [currentParam, setCurrentParam] = useQueryParam(paramName)

  const [deserializedParam, setDeserializedParam] = useState<ChainId | null>(
    currentParam ? deserialize(currentParam) : fallback,
  )

  useEffect(() => {
    if (deserializedParam !== null) {
      setCurrentParam(serialize(deserializedParam))
      return
    }
    // In case of invalid param we fallback to the default one
    setCurrentParam(ChainId.getName(fallback))
    // Do we need to add `setCurrentParam` to deps?
  }, [deserializedParam, setCurrentParam])

  return [deserializedParam, setDeserializedParam] as const
}
