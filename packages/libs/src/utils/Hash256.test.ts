import { expect } from 'earl'

import { Hash256 } from './Hash256'

describe(Hash256.name, () => {
  it('triple equals', () => {
    const hashString = Hash256.random().toString()

    const hash1 = Hash256(hashString)
    const hash2 = Hash256(hashString)

    expect(hash1 === hash2).toBeTruthy()
  })
})
