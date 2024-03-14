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
import { providers, utils } from 'ethers'

export { BlockchainOAppRemotesProvider }
export type { OAppRemotesProvider }

interface OAppRemotesProvider {
  getSupportedRemotes(oAppsAddress: EthereumAddress): Promise<ChainId[]>
}

const oftIface = new utils.Interface([
  'function trustedRemoteLookup(uint16 _remoteChainId) view returns (bytes)',
])

const stargateIface = new utils.Interface([
  'function dstContractLookup(uint16 _remoteChainId) view returns (bytes)',
])

/**
 * Fetches the supported remotes for an OApp from the blockchain directly.
 * Supports both OFT and Stargate-like contracts.
 * Classic OFT V1 remotes can be resolved via trusted remotes lookup
 * Stargate-like remotes can be resolved via dstContractLookup
 */
class BlockchainOAppRemotesProvider implements OAppRemotesProvider {
  constructor(
    private readonly provider: providers.StaticJsonRpcProvider,
    private readonly multicall: MulticallClient,
    chainId: ChainId,
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this).tag(ChainId.getName(chainId))
  }
  public async getSupportedRemotes(
    oAppAddress: EthereumAddress,
  ): Promise<ChainId[]> {
    const blockNumber = await this.provider.getBlockNumber()

    const supportedChains = ChainId.getAll()

    const supportedEndpoints = supportedChains.flatMap(
      (chainId) => EndpointID.encodeV1(chainId) ?? [],
    )

    assert(
      supportedEndpoints.length === supportedChains.length,
      'Cannot translate some chains to EID',
    )

    const oAppSupportedRemotes = await this.getSingleOAppRemotes(
      oAppAddress,
      supportedEndpoints,
      blockNumber,
    )

    return oAppSupportedRemotes
  }

  private async getSingleOAppRemotes(
    oAppAddress: EthereumAddress,
    supportedEndpoints: number[],
    blockNumber: number,
  ): Promise<ChainId[]> {
    const isOft = await this.checkForOft(oAppAddress, blockNumber)

    const encode = isOft ? encodeOft : encodeStargate
    const decode = isOft ? decodeOft : decodeStargate

    const requests = supportedEndpoints.map((eid) => encode(oAppAddress, eid))

    const result = await this.multicall.multicall(requests, blockNumber)

    // Remap EIDs according to indexes, and return only supported ones
    return (
      supportedEndpoints
        .map((eid, i) => ({
          eid,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          supported: decode(result[i]!),
        }))
        .filter((x) => x.supported)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((x) => EndpointID.decodeV1(x.eid)!)
    )
  }

  private async checkForOft(
    oApp: EthereumAddress,
    blockNumber: number,
  ): Promise<boolean> {
    const data = oftIface.encodeFunctionData('trustedRemoteLookup', [
      // Example EID
      EndpointID.encodeV1(ChainId.ETHEREUM) ?? 0,
    ])

    const request = {
      address: oApp,
      data: Bytes.fromHex(data),
    }

    try {
      const [result] = await this.multicall.multicall([request], blockNumber)

      return Boolean(result?.success)
    } catch (error) {
      return false
    }
  }
}

function decodeStargate(response: MulticallResponse): boolean {
  const [decoded] = stargateIface.decodeFunctionResult(
    'dstContractLookup',
    response.data.toString(),
  )

  return decoded !== '0x'
}

function encodeStargate(
  oAppAddress: EthereumAddress,
  eid: number,
): MulticallRequest {
  {
    const data = stargateIface.encodeFunctionData('dstContractLookup', [eid])

    return {
      address: oAppAddress,
      data: Bytes.fromHex(data),
    }
  }
}

function decodeOft(response: MulticallResponse): boolean {
  const [decoded] = oftIface.decodeFunctionResult(
    'trustedRemoteLookup',
    response.data.toString(),
  )

  return decoded !== '0x'
}

function encodeOft(
  oAppAddress: EthereumAddress,
  eid: number,
): MulticallRequest {
  {
    const data = oftIface.encodeFunctionData('trustedRemoteLookup', [eid])

    return {
      address: oAppAddress,
      data: Bytes.fromHex(data),
    }
  }
}
