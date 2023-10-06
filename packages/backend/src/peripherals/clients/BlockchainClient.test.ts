import { Logger } from '@l2beat/backend-tools'
import { RateLimitedProvider } from '@l2beat/discovery'
import { EthereumAddress } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'

import { BlockchainClient } from './BlockchainClient'

describe(BlockchainClient.name, () => {
  describe(BlockchainClient.prototype.getAllLogs.name, () => {
    it('divides on two calls', async () => {
      const provider = mockObject<RateLimitedProvider>({
        getLogs: mockFn()
          .throwsOnce(new Error('Log response size exceeded'))
          .returnsOnce([])
          .returnsOnce([]),
      })

      const blockchainClient = new BlockchainClient(provider, Logger.SILENT)

      const address = EthereumAddress.random()
      const topic = 'aaaa'
      await blockchainClient.getAllLogs(address, topic, 1000, 2000)

      expect(provider.getLogs).toHaveBeenCalledTimes(3)
      expect(provider.getLogs).toHaveBeenNthCalledWith(1, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 1000,
        toBlock: 2000,
      })
      expect(provider.getLogs).toHaveBeenNthCalledWith(2, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 1000,
        toBlock: 1500,
      })
      expect(provider.getLogs).toHaveBeenNthCalledWith(3, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 1501,
        toBlock: 2000,
      })
    })

    it('correctly divides range of two', async () => {
      const provider = mockObject<RateLimitedProvider>({
        getLogs: mockFn()
          .throwsOnce(new Error('Log response size exceeded'))
          .returnsOnce([])
          .returnsOnce([]),
      })

      const blockchainClient = new BlockchainClient(provider, Logger.SILENT)

      const address = EthereumAddress.random()
      const topic = 'aaaa'
      await blockchainClient.getAllLogs(address, topic, 1, 2)

      expect(provider.getLogs).toHaveBeenCalledTimes(3)
      expect(provider.getLogs).toHaveBeenNthCalledWith(1, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 1,
        toBlock: 2,
      })
      expect(provider.getLogs).toHaveBeenNthCalledWith(2, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 1,
        toBlock: 1,
      })
      expect(provider.getLogs).toHaveBeenNthCalledWith(3, {
        address: address.toString(),
        topics: [topic],
        fromBlock: 2,
        toBlock: 2,
      })
    })

    it('fromBlock === toBlock', async () => {
      const provider = mockObject<RateLimitedProvider>({
        getLogs: mockFn().throwsOnce(new Error('Log response size exceeded')),
      })

      const blockchainClient = new BlockchainClient(provider, Logger.SILENT)

      const address = EthereumAddress.random()
      const topic = 'aaaa'

      await expect(
        blockchainClient.getAllLogs(address, topic, 1, 1),
      ).toBeRejected()

      expect(provider.getLogs).toHaveBeenOnlyCalledWith({
        address: address.toString(),
        topics: [topic],
        fromBlock: 1,
        toBlock: 1,
      })
    })
  })
})
