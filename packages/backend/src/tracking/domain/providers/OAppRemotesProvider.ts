import { assert, Logger } from '@l2beat/backend-tools'
import { MulticallClient } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { ChainId, EndpointID, EthereumAddress } from '@lz/libs'
import { providers } from 'ethers'

import { OAppInterfaceResolver } from './interface-resolvers/resolver'

export { BlockchainOAppRemotesProvider }
export type { OAppRemotesProvider }

interface OAppRemotesProvider {
  getSupportedRemotes(oAppsAddress: EthereumAddress): Promise<ChainId[]>
}

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
    private readonly monitoredChains: ChainId[],
    private readonly ifaceResolvers: OAppInterfaceResolver[],
    private readonly logger: Logger,
  ) {
    this.logger = this.logger.for(this).tag(ChainId.getName(chainId))
  }
  public async getSupportedRemotes(
    oAppAddress: EthereumAddress,
  ): Promise<ChainId[]> {
    const blockNumber = await this.provider.getBlockNumber()

    const supportedEndpoints = this.monitoredChains.flatMap(
      (chainId) => EndpointID.encodeV1(chainId) ?? [],
    )

    assert(
      supportedEndpoints.length === this.monitoredChains.length,
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
    const resolver = await this.findResolver(oAppAddress, blockNumber)

    assert(
      resolver,
      `No interface resolver found for OApp: ${oAppAddress.toString()} at block ${blockNumber}`,
    )

    const requests = supportedEndpoints.map((eid) =>
      resolver.encode(oAppAddress, eid),
    )

    const result = await this.multicall.multicall(requests, blockNumber)

    // Remap EIDs according to indexes, and return only supported ones
    return (
      supportedEndpoints
        .map((eid, i) => ({
          eid,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          supported: resolver.decode(result[i]!),
        }))
        .filter((x) => x.supported)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((x) => EndpointID.decodeV1(x.eid)!)
    )
  }

  private async findResolver(
    oAppAddress: EthereumAddress,
    blockNumber: number,
  ): Promise<OAppInterfaceResolver | null> {
    for (const ifaceResolver of this.ifaceResolvers) {
      if (await ifaceResolver.isSupported(oAppAddress, blockNumber)) {
        return ifaceResolver
      }
    }

    return null
  }
}
