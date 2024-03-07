import { EthereumAddress, stringAs, SupportedChainId } from '@lz/libs'
import { z } from 'zod'

export { OAppConfiguration }
export type { OAppConfigurations }

const OAppConfiguration = z.object({
  oracle: stringAs(EthereumAddress),
  relayer: stringAs(EthereumAddress),
  inboundProofLibraryVersion: z.number(),
  outboundProofType: z.number(),
  outboundBlockConfirmations: z.number(),
  inboundBlockConfirmations: z.number(),
})

type OAppConfiguration = z.infer<typeof OAppConfiguration>

type OAppConfigurations = Record<SupportedChainId, OAppConfiguration>
