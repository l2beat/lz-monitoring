import {
  MulticallRequest,
  MulticallResponse,
  // eslint-disable-next-line import/no-internal-modules
} from '@l2beat/discovery/dist/discovery/provider/multicall/types'
import { EthereumAddress } from '@lz/libs'

export type { OAppInterfaceResolver }

/**
 * Interface for remote resolvers.
 * Each resolver is responsible for checking if given oApp is supported for given resolver
 * and if so, for encoding and decoding calls to multicall.
 */
interface OAppInterfaceResolver {
  /**
   * Check if resolver interface is supported for given oApp
   */
  isSupported(
    oAppAddress: EthereumAddress,
    blockNumber: number,
  ): Promise<boolean>

  /**
   * Encode request for multicall
   */
  encode(oAppAddress: EthereumAddress, eid: number): MulticallRequest
  /**
   * Decode response and check if payload indicates that remote is supported
   */
  decode(response: MulticallResponse): boolean
}
