import { Logger } from '@l2beat/backend-tools'
import { MulticallClient } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { MulticallResponse } from '@l2beat/discovery/dist/discovery/provider/multicall/types'
// eslint-disable-next-line import/no-internal-modules
import { Bytes } from '@l2beat/discovery/dist/utils/Bytes'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect, mockFn, mockObject } from 'earl'
import { providers } from 'ethers'

import { BlockchainOAppConfigurationProvider } from './OAppConfigurationProvider'

// getAppConfig()
const mockBytesResponse = Bytes.fromHex(
  '0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000902f09715b6303d4173037652fa7377e5b98089e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000d56e4eab23cb81f43168f9f45211eb027b9ac7cc',
)

describe(BlockchainOAppConfigurationProvider.name, () => {
  it('decodes latest configuration for given OApp', async () => {
    const blockNumber = 123
    const oAppAddress = EthereumAddress.random()
    const rpcProvider = mockObject<providers.StaticJsonRpcProvider>({
      getBlockNumber: mockFn().resolvesTo(blockNumber),
    })

    const mcResponse: MulticallResponse[] = ChainId.getAll().map(() => ({
      success: true,
      data: mockBytesResponse,
    }))

    const multicall = mockObject<MulticallClient>({
      multicall: mockFn().resolvesTo(mcResponse),
    })

    const provider = new BlockchainOAppConfigurationProvider(
      rpcProvider,
      multicall,
      EthereumAddress.random(),
      ChainId.ETHEREUM,
      Logger.SILENT,
    )

    const result = await provider.getConfiguration(
      oAppAddress,
      ChainId.getAll(),
    )

    const keys = Object.keys(result)

    // Remapped chain ids
    expect(keys).toEqual([
      '1',
      '10',
      '56',
      '137',
      '1101',
      '8453',
      '42161',
      '42220',
      '43114',
      '59144',
    ])

    const configurationsPerChain = Object.values(result)

    for (const config of configurationsPerChain) {
      expect(config.oracle).toBeTruthy()
      expect(config.relayer).toBeTruthy()
      expect(config.inboundProofLibraryVersion).toBeTruthy()
      expect(config.outboundProofType).toBeTruthy()
      expect(config.outboundBlockConfirmations).toBeTruthy()
      expect(config.inboundBlockConfirmations).toBeTruthy()
    }
  })
})
