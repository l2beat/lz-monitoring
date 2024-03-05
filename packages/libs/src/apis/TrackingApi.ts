import { z } from 'zod'

import { ChainId } from '../chainId'
import { branded, EthereumAddress } from '../utils'

export {
  OAppsResponse,
  OAppWithConfigs,
  ResolvedConfiguration,
  ResolvedConfigurationWithAppId,
}

const BaseConfiguration = z.object({
  targetChainId: branded(z.number(), ChainId),
  configuration: z.object({
    relayer: branded(z.string(), EthereumAddress),
    oracle: branded(z.string(), EthereumAddress),
    inboundProofLibraryVersion: z.number(),
    outboundProofType: z.number(),
  }),
  isDefault: z.boolean(),
})
type BaseConfiguration = z.infer<typeof BaseConfiguration>

const DefaultConfiguration = BaseConfiguration.extend({
  isDefault: z.literal(true),
})
type DefaultConfiguration = z.infer<typeof DefaultConfiguration>

const ChangedConfiguration = BaseConfiguration.extend({
  isDefault: z.literal(false),
  diffs: z.array(z.string()), // keyof OAppConfiguration
})
type ChangedConfiguration = z.infer<typeof ChangedConfiguration>

const ResolvedConfiguration = z.discriminatedUnion('isDefault', [
  DefaultConfiguration,
  ChangedConfiguration,
])
type ResolvedConfiguration = z.infer<typeof ResolvedConfiguration>

const ResolvedConfigurationWithAppId = z.discriminatedUnion('isDefault', [
  DefaultConfiguration.extend({
    oAppId: z.number(),
  }),
  ChangedConfiguration.extend({
    oAppId: z.number(),
  }),
])
type ResolvedConfigurationWithAppId = z.infer<
  typeof ResolvedConfigurationWithAppId
>

const OAppWithConfigs = z.object({
  name: z.string(),
  address: branded(z.string(), EthereumAddress),
  iconUrl: z.string(),
  configurations: z.array(ResolvedConfiguration),
})

type OAppWithConfigs = z.infer<typeof OAppWithConfigs>

const OAppsResponse = z.object({
  sourceChainId: branded(z.number(), ChainId),
  oApps: z.array(OAppWithConfigs),
})

type OAppsResponse = z.infer<typeof OAppsResponse>
