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
      address: branded(z.string(), EthereumAddress),
      blockedLibrary: branded(z.string(), EthereumAddress),
      defaultReceiveLibraries: z.record(z.string()),
      defaultSendLibraries: z.record(z.string()),
      eid: z.number(),
      registeredLibraries: z.array(branded(z.string(), EthereumAddress)),
      lzToken: branded(z.string(), EthereumAddress),
      nativeToken: branded(z.string(), EthereumAddress),
      owner: branded(z.string(), EthereumAddress),
    }),
    sendUln302: z.object({
      name: z.literal('SendUln302'),
      address: branded(z.string(), EthereumAddress),
      defaultExecutorConfigs: z.array(
        z.object({
          params: z.tuple([
            z.tuple([
              z.number(), // EID
              // gas, executor address
              z.tuple([z.number(), z.string()]),
            ]),
          ]),
        }),
      ),
      defaultUlnConfigs: z.array(
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
      ),
      messageLibType: z.number(),
      owner: branded(z.string(), EthereumAddress),
      treasury: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
    }),
    receiveUln302: z.object({
      name: z.literal('ReceiveUln302'),
      address: branded(z.string(), EthereumAddress),
      defaultUlnConfigs: z.array(
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
      ),
      messageLibType: z.number(),
      owner: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
    }),
    sendUln301: z.object({
      name: z.literal('SendUln301'),
      address: branded(z.string(), EthereumAddress),
      defaultExecutorConfigs: z.array(
        z.object({
          params: z.tuple([
            z.tuple([
              z.number(), // EID
              // gas, executor address
              z.tuple([z.number(), z.string()]),
            ]),
          ]),
        }),
      ),
      defaultUlnConfigs: z.array(
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
      ),
      owner: branded(z.string(), EthereumAddress),
      treasury: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
    }),
    receiveUln301: z.object({
      name: z.literal('ReceiveUln301'),
      address: branded(z.string(), EthereumAddress),
      defaultExecutors: z.array(
        z.object({
          // EID, Executor
          params: z.tuple([z.tuple([z.number(), z.string()])]),
        }),
      ),
      defaultUlnConfigs: z.array(
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
      ),
      owner: branded(z.string(), EthereumAddress),
      version: z.tuple([z.number(), z.number(), z.number()]),
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
