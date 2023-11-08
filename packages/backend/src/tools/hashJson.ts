import { Hash256 } from '@lz/libs'
import { createHash } from 'crypto'

export type json =
  | string
  | number
  | boolean
  | null
  | json[]
  | { [key: string]: json }

export function hashJson(value: json): Hash256 {
  const message = JSON.stringify(value)
  const hex: string = createHash('sha256').update(message).digest('hex')
  return Hash256('0x' + hex)
}
