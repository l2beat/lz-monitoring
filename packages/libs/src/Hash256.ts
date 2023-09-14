export type Hash256 = string & {
  _Hash256Brand: string
}

export function Hash256(value: string): Hash256 {
  if (!/^0x[\da-f]{64}$/.test(value)) {
    throw new TypeError('Invalid Hash256')
  }
  return value as unknown as Hash256
}

Hash256.random = function random() {
  const digit = (): string =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    '0123456789abcdef'[Math.floor(Math.random() * 16)]!
  return Hash256('0x' + Array.from({ length: 64 }).map(digit).join(''))
}
