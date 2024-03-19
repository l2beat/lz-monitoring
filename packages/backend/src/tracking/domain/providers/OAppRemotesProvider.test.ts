import { Logger } from '@l2beat/backend-tools'
import { MulticallClient } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { MulticallResponse } from '@l2beat/discovery/dist/discovery/provider/multicall/types'
// eslint-disable-next-line import/no-internal-modules
import { Bytes } from '@l2beat/discovery/dist/utils/Bytes'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'
import { providers } from 'ethers'

import { OAppInterfaceResolver } from './interface-resolvers/resolver'
import { BlockchainOAppRemotesProvider } from './OAppRemotesProvider'

describe(BlockchainOAppRemotesProvider.name, () => {
  it('resolves available remotes for given OApp', async () => {
    const blockNumber = 123
    const oAppAddress = EthereumAddress.random()
    const rpcProvider = mockObject<providers.StaticJsonRpcProvider>({
      getBlockNumber: mockFn().resolvesTo(blockNumber),
    })

    const mcResponse: MulticallResponse[] = ChainId.getAll().map(() => ({
      success: true,
      data: Bytes.fromHex('0x0'),
    }))

    const multicall = mockObject<MulticallClient>({
      multicall: mockFn().resolvesTo(mcResponse),
    })

    const supportedChains = [ChainId.ETHEREUM, ChainId.ARBITRUM]

    const resolverA: OAppInterfaceResolver = {
      isSupported: async () => false,
      encode: () => ({ address: oAppAddress, data: Bytes.fromHex('0x0') }),
      decode: () => true,
    }

    const resolverB: OAppInterfaceResolver = {
      isSupported: async () => true,
      encode: () => ({ address: oAppAddress, data: Bytes.fromHex('0x0') }),
      decode: () => true,
    }

    const provider = new BlockchainOAppRemotesProvider(
      rpcProvider,
      multicall,
      ChainId.ETHEREUM,
      supportedChains,
      [resolverA, resolverB],
      Logger.SILENT,
    )

    const result = await provider.getSupportedRemotes(oAppAddress)

    expect(result).toEqual(supportedChains)
  })
})
