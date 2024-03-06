import { Logger } from '@l2beat/backend-tools'
import { HttpClient } from '@l2beat/discovery'
import { EthereumAddress } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'

import { HttpOAppListProvider } from './OAppsListProvider'

describe(HttpOAppListProvider.name, () => {
  describe(HttpOAppListProvider.prototype.getOApps.name, () => {
    it('rejects when response is not ok', async () => {
      const logger = mockObject<Logger>({
        error: mockFn(() => {}),
      })
      const client = mockObject<HttpClient>({
        fetch: mockFn().resolvesTo({
          ok: false,
        }),
      })

      const provider = new HttpOAppListProvider(
        logger,
        client,
        'http://example.com',
      )

      await expect(async () => provider.getOApps()).toBeRejectedWith(
        'Failed to fetch OApps from given url',
      )
    })

    it('rejects if response shape is incorrect', async () => {
      const mockResponse = [
        {
          namea: 'name',
          address: '0x00000000000000000000000000000000000dead',
          iconUrl: 'iconUrl',
          incorrectField: 'incorrectField',
        },
      ]

      const logger = mockObject<Logger>({
        error: mockFn(() => {}),
      })
      const client = mockObject<HttpClient>({
        fetch: mockFn().resolvesTo({
          ok: true,
          json: mockFn().resolvesTo(mockResponse),
        }),
      })

      const provider = new HttpOAppListProvider(
        logger,
        client,
        'http://example.com',
      )

      await expect(async () => provider.getOApps()).toBeRejected()
    })

    it('fetches and parses response', async () => {
      const mockResponse = [
        {
          name: 'name1',
          symbol: 'symbol1',
          address: EthereumAddress.random(),
          iconUrl: 'iconUrl1',
        },
        {
          name: 'name2',
          symbol: 'symbol2',
          address: EthereumAddress.random(),
          iconUrl: null,
        },
      ]

      const logger = mockObject<Logger>({
        error: mockFn(() => {}),
      })
      const client = mockObject<HttpClient>({
        fetch: mockFn().resolvesTo({
          ok: true,
          json: mockFn().resolvesTo(mockResponse),
        }),
      })

      const provider = new HttpOAppListProvider(
        logger,
        client,
        'http://example.com',
      )

      const result = await provider.getOApps()

      expect(result).toEqual(mockResponse)
    })
  })
})
