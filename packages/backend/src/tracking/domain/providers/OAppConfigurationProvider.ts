import { assert, Logger } from '@l2beat/backend-tools'
import { MulticallClient } from '@l2beat/discovery'
import {
  MulticallRequest,
  MulticallResponse,
  // eslint-disable-next-line import/no-internal-modules
} from '@l2beat/discovery/dist/discovery/provider/multicall/types'
// eslint-disable-next-line import/no-internal-modules
import { Bytes } from '@l2beat/discovery/dist/utils/Bytes'
import { ChainId, EndpointID, EthereumAddress } from '@lz/libs'
import { BigNumber, providers, utils } from 'ethers'

import { OAppConfiguration, OAppConfigurations } from '../configuration'

export { BlockchainOAppConfigurationProvider }
export type { OAppConfigurationProvider }

interface OAppConfigurationProvider {
  getConfiguration(address: EthereumAddress): Promise<OAppConfigurations>
}

const iface = new utils.Interface([
  'function getAppConfig(uint16 _remoteChainId, address _ua) view returns (tuple(uint16 inboundProofLibraryVersion, uint64 inboundBlockConfirmations, address relayer, uint16 outboundProofType, uint64 outboundBlockConfirmations, address oracle))',
])

class BlockchainOAppConfigurationProvider implements OAppConfigurationProvider {
  constructor(
    private readonly provider: providers.StaticJsonRpcProvider,
    private readonly multicall: MulticallClient,
    private readonly ulnV2Address: EthereumAddress,
    chainId: ChainId,
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this).tag(ChainId.getName(chainId))
  }
  public async getConfiguration(
    address: EthereumAddress,
  ): Promise<OAppConfigurations> {
    const blockNumber = await this.provider.getBlockNumber()

    const supportedChains = ChainId.getAll()

    const supportedEids = supportedChains.flatMap(
      (chainId) => EndpointID.encodeV1(chainId) ?? [],
    )

    assert(
      supportedEids.length === supportedChains.length,
      'Cannot translate some chains to EID',
    )

    const requests = supportedEids.map((eid) =>
      this.encodeForMulticall(address, eid),
    )

    const result = await this.multicall.multicall(requests, blockNumber)

    const decoded = result.map((res, i) => {
      const eid = supportedEids[i]
      assert(eid !== undefined)

      const chainId = EndpointID.decodeV1(eid)

      assert(chainId !== undefined, 'Cannot translate EID to chain id')

      const config = this.decodeFromMulticall(res)

      return [chainId.valueOf(), config] as const
    })

    return Object.fromEntries(decoded) as OAppConfigurations
  }

  private encodeForMulticall(
    oAppAddress: EthereumAddress,
    eid: number,
  ): MulticallRequest {
    {
      const data = iface.encodeFunctionData('getAppConfig', [eid, oAppAddress])

      return {
        address: this.ulnV2Address,
        data: Bytes.fromHex(data),
      }
    }
  }

  private decodeFromMulticall(response: MulticallResponse): OAppConfiguration {
    const [decoded] = iface.decodeFunctionResult(
      'getAppConfig',
      response.data.toString(),
    )

    const toParse: unknown = {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
      oracle: decoded.oracle,
      relayer: decoded.relayer,
      inboundProofLibraryVersion: decoded.inboundProofLibraryVersion,
      outboundProofType: decoded.outboundProofType,
      inboundBlockConfirmations: BigNumber.from(
        decoded.inboundBlockConfirmations,
      ).toNumber(),
      outboundBlockConfirmations: BigNumber.from(
        decoded.outboundBlockConfirmations,
      ).toNumber(),
      /* eslint-enable */
    }

    return OAppConfiguration.parse(toParse)
  }
}
