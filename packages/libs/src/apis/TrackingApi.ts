import { z } from 'zod'

import { ChainId } from '../chainId'
import { branded, EthereumAddress } from '../utils'

export {
  OAppsResponse,
  OAppWithConfigs,
  ResolvedConfiguration,
  ResolvedConfigurationWithAppId,
}

const OAppConfiguration = z.object({
  relayer: branded(z.string(), EthereumAddress),
  oracle: branded(z.string(), EthereumAddress),
  inboundProofLibraryVersion: z.number(),
  outboundProofType: z.number(),
  outboundBlockConfirmations: z.number(),
  inboundBlockConfirmations: z.number(),
})
type OAppConfiguration = z.infer<typeof OAppConfiguration>

const BaseConfiguration = z.object({
  targetChainId: branded(z.number(), ChainId),
  isDefault: z.boolean(),
})
type BaseConfiguration = z.infer<typeof BaseConfiguration>

const DefaultConfiguration = BaseConfiguration.extend({
  isDefault: z.literal(true),
})
type DefaultConfiguration = z.infer<typeof DefaultConfiguration>

const ChangedConfiguration = BaseConfiguration.extend({
  isDefault: z.literal(false),
  changedConfiguration: OAppConfiguration.partial(),
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
  symbol: z.string(),
  address: branded(z.string(), EthereumAddress),
  iconUrl: z.string().nullable(),
  configurations: z.array(ResolvedConfiguration),
})

type OAppWithConfigs = z.infer<typeof OAppWithConfigs>

const OAppsResponse = z.object({
  sourceChainId: branded(z.number(), ChainId),
  oApps: z.array(OAppWithConfigs),
  defaultConfigurations: z.array(
    z.object({
      targetChainId: branded(z.number(), ChainId),
      configuration: OAppConfiguration,
    }),
  ),
})

type OAppsResponse = z.infer<typeof OAppsResponse>
