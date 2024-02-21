import { useEffect, useState } from 'react'

import { useQueryParam } from './useQueryParam'

interface BaseOptions<T> {
  paramName: string
  serialize: (value: T) => string | null
  deserialize: (value: string) => T | null
}
type WithFallback<T> = BaseOptions<T> & {
  fallback: T
}

type WithoutFallback<T> = BaseOptions<T> & {
  fallback: undefined
}

export function useSerializableQueryParam<T>(
  options: WithFallback<T>,
): [NonNullable<T>, (newValue: NonNullable<T>) => void]
export function useSerializableQueryParam<T>(
  options: WithoutFallback<T>,
): [T | null, (newValue: T | null) => void]
export function useSerializableQueryParam<T>({
  paramName,
  fallback,
  serialize,
  deserialize,
}: WithFallback<T> | WithFallback<T>) {
  const [currentParam, setCurrentParam] = useQueryParam(paramName)

  const actualFallback = fallback ?? null

  const param = currentParam
    ? deserialize(currentParam) ?? actualFallback
    : actualFallback

  const [deserializedParam, setDeserializedParam] = useState(param)

  useEffect(() => {
    setCurrentParam(deserializedParam ? serialize(deserializedParam) : null)
  }, [deserializedParam, setCurrentParam, serialize])

  return [deserializedParam, setDeserializedParam] as const
}
