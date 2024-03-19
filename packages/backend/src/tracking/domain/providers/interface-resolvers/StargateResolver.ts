import { MulticallClient } from '@l2beat/discovery'
import {
  MulticallRequest,
  MulticallResponse,
  // eslint-disable-next-line import/no-internal-modules
} from '@l2beat/discovery/dist/discovery/provider/multicall/types'
// eslint-disable-next-line import/no-internal-modules
import { Bytes } from '@l2beat/discovery/dist/utils/Bytes'
import { ChainId, EndpointID, EthereumAddress } from '@lz/libs'
import { utils } from 'ethers'

import { OAppInterfaceResolver } from './resolver'

export { StargateInterfaceResolver }

class StargateInterfaceResolver implements OAppInterfaceResolver {
  private readonly iface = new utils.Interface([
    'function dstContractLookup(uint16 _remoteChainId) view returns (bytes)',
  ])

  public constructor(private readonly multicall: MulticallClient) {}

  public async isSupported(
    oAppAddress: EthereumAddress,
    blockNumber: number,
  ): Promise<boolean> {
    const data = this.iface.encodeFunctionData('dstContractLookup', [
      // Example EID
      EndpointID.encodeV1(ChainId.ETHEREUM) ?? 0,
    ])

    const request = {
      address: oAppAddress,
      data: Bytes.fromHex(data),
    }

    try {
      const [result] = await this.multicall.multicall([request], blockNumber)

      return Boolean(result?.success)
    } catch (error) {
      return false
    }
  }

  public encode(oAppAddress: EthereumAddress, eid: number): MulticallRequest {
    {
      const data = this.iface.encodeFunctionData('dstContractLookup', [eid])

      return {
        address: oAppAddress,
        data: Bytes.fromHex(data),
      }
    }
  }

  public decode(response: MulticallResponse): boolean {
    const [decoded] = this.iface.decodeFunctionResult(
      'dstContractLookup',
      response.data.toString(),
    )

    return decoded !== '0x'
  }
}
