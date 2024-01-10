import { z } from 'zod'

import { ChainId } from '../chainId/ChainId'
import { branded } from '../utils/branded'
import { EthereumAddress } from '../utils/EthereumAddress'

const DefaultAdapterParams = z.array(
  z.object({
    proofType: z.number(),
    adapterParams: z.string(),
  }),
)
export type DefaultAdapterParams = z.infer<typeof DefaultAdapterParams>

const DefaultExecutorConfigs = z.array(
  z.object({
    params: z.tuple([
      z.tuple([
        z.number(), // EID
        // gas, executor address
        z.tuple([z.number(), z.string()]),
      ]),
    ]),
  }),
)
export type DefaultExecutorConfigs = z.infer<typeof DefaultExecutorConfigs>

const DefaultExecutors = z.array(
  z.object({
    // EID, Executor
    params: z.tuple([z.tuple([z.number(), z.string()])]),
  }),
)
export type DefaultExecutors = z.infer<typeof DefaultExecutors>

const DefaultUlnConfigs = z.array(
  z.object({
    params: z.tuple([
      z.tuple([
        z.number(), // EID
        z.tuple([
          z.number(), // confirmations
          z.number(), // requiredDVNCount
          z.number(), // optionalDVNCount
          z.number(), // optionalDVNCountThreshold
          z.array(z.string()), // requiredDVNs
          z.array(z.string()), // optionalDVNs
        ]),
      ]),
    ]),
  }),
)

export type DefaultUlnConfigs = z.infer<typeof DefaultUlnConfigs>

const DefaultAppConfig = z.object({
  inboundProofLib: z.object({
    version: z.number(),
    address: branded(z.string(), EthereumAddress),
  }),
  inboundProofConfirm: z.number(),
  outboundProofType: z.number(),
  outboundBlockConfirm: z.number(),
  oracle: branded(z.string(), EthereumAddress),
  relayer: branded(z.string(), EthereumAddress),
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
})
export type RemoteChain = z.infer<typeof RemoteChain>

export const DiscoveryApi = z.object({
  blockNumber: z.number(),
  contracts: z.object({
    // V1
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
    lzMultisig: z
      .object({
        name: z.literal('LayerZero Multisig'),
        address: branded(z.string(), EthereumAddress),
        owners: z.array(branded(z.string(), EthereumAddress)),
        threshold: z.number(),
      })
      .nullable(),
    // V2
    endpointV2: z.object({
      name: z.literal('EndpointV2'),
      eid: z.number(),
      defaultSendLibraries: z.record(z.string()),
      defaultReceiveLibraries: z.record(z.string()),
      owner: branded(z.string(), EthereumAddress),
      address: branded(z.string(), EthereumAddress),
      lzToken: branded(z.string(), EthereumAddress),
      nativeToken: branded(z.string(), EthereumAddress),
      blockedLibrary: branded(z.string(), EthereumAddress),
      registeredLibraries: z.array(branded(z.string(), EthereumAddress)),
    }),
    sendUln302: z.object({
      name: z.literal('SendUln302'),
      messageLibType: z.number(),
      owner: branded(z.string(), EthereumAddress),
      address: branded(z.string(), EthereumAddress),
      treasury: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
      defaultExecutorConfigs: DefaultExecutorConfigs,
      defaultUlnConfigs: DefaultUlnConfigs,
    }),
    receiveUln302: z.object({
      name: z.literal('ReceiveUln302'),
      messageLibType: z.number(),
      owner: branded(z.string(), EthereumAddress),
      address: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
      defaultUlnConfigs: DefaultUlnConfigs,
    }),
    sendUln301: z.object({
      name: z.literal('SendUln301'),
      owner: branded(z.string(), EthereumAddress),
      address: branded(z.string(), EthereumAddress),
      treasury: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
      defaultExecutorConfigs: DefaultExecutorConfigs,
      defaultUlnConfigs: DefaultUlnConfigs,
    }),
    receiveUln301: z.object({
      name: z.literal('ReceiveUln301'),
      owner: branded(z.string(), EthereumAddress),
      address: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
      defaultExecutors: DefaultExecutors,
      defaultUlnConfigs: DefaultUlnConfigs,
    }),
  }),
  addressInfo: z.array(
    z.object({
      address: branded(z.string(), EthereumAddress),
      name: z.string(),
      verified: z.boolean(),
    }),
  ),
})
export type DiscoveryApi = z.infer<typeof DiscoveryApi>
