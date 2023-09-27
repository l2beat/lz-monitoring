import { z } from 'zod'

import { branded } from './branded'
import { ChainId } from './chainId/ChainId'
import { EthereumAddress } from './EthereumAddress'

const DefaultAdapterParams = z.object({
  proofType: z.number(),
  adapterParams: z.string(),
})
export type DefaultAdapterParams = z.infer<typeof DefaultAdapterParams>

const DefaultAppConfig = z.object({
  inboundProofLib: z.number(),
  inboundProofConfirm: z.number(),
  outboundProofType: z.number(),
  outboundBlockConfirm: z.number(),
  oracle: branded(z.string(), EthereumAddress),
})
export type DefaultAppConfig = z.infer<typeof DefaultAppConfig>

export const RemoteChain = z.object({
  // TODO: The 3 following can be compressed to just one chainId
  name: z.string(),
  chainId: branded(z.number(), ChainId),
  lzChainId: z.number(),
  uln: branded(z.string(), EthereumAddress),
  defaultAppConfig: DefaultAppConfig,
  defaultAdapterParams: DefaultAdapterParams,
  supportedOutboundProof: z.array(z.number()),
  inboundProofLibrary: z.array(branded(z.string(), EthereumAddress)),
})
export type RemoteChain = z.infer<typeof RemoteChain>

export const DiscoveryApi = z.object({
  blockNumber: z.number(),
  contracts: z.object({
    endpoint: z.object({
      name: z.literal('Endpoint'),
      address: branded(z.string(), EthereumAddress),
      owner: branded(z.string(), EthereumAddress),
      defaultSendLibrary: branded(z.string(), EthereumAddress),
      defaultReceiveLibrary: branded(z.string(), EthereumAddress),
      libraryLookup: z.array(branded(z.string(), EthereumAddress)),
    }),
    ulnV2: z.object({
      name: z.literal('UltraLightNodeV2'),
      address: branded(z.string(), EthereumAddress),
      owner: branded(z.string(), EthereumAddress),
      treasuryContract: branded(z.string(), EthereumAddress),
      layerZeroToken: branded(z.string(), EthereumAddress),
      remoteChains: z.array(RemoteChain),
    }),
    lzMultisig: z.object({
      name: z.literal('LayerZero Multisig'),
      address: branded(z.string(), EthereumAddress),
      owners: z.array(branded(z.string(), EthereumAddress)),
      threshold: z.number(),
    }),
  }),
})
export type DiscoveryApi = z.infer<typeof DiscoveryApi>
