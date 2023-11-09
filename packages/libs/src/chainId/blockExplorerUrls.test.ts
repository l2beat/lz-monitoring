import { expect } from 'earl'

import { BLOCK_EXPLORER_URLS } from './blockExplorerUrls'

describe('block explorer urls', () => {
  describe('should have the correct block explorer urls', () => {
    for (const blockExplorerUrl of Object.values(BLOCK_EXPLORER_URLS)) {
      it(blockExplorerUrl, () => {
        expect(blockExplorerUrl).toMatchRegex(/^https?:\/\/.+\/$/)
      })
    }
  })
})
