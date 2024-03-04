import { ChainId, EthereumAddress, stringAs, SupportedChainId } from '@lz/libs'
import { z } from 'zod'

export { OAppConfiguration }
export type { OAppConfigurations }

const OAppConfiguration = z.object({
  oracle: stringAs(EthereumAddress),
  relayer: stringAs(EthereumAddress),
  inboundProofLibraryVersion: z.number(),
  outboundProofType: z.number(),
})

type OAppConfiguration = z.infer<typeof OAppConfiguration>

type OAppConfigurations = Record<SupportedChainId, OAppConfiguration>

export function compareOAppConfigurations(
  a: OAppConfigurations,
  b: OAppConfigurations,
): { chainId: ChainId; match: boolean }[] {
  const supportedChainIds = ChainId.getAll().map((id) =>
    id.valueOf(),
  ) as SupportedChainId[]

  const results = supportedChainIds.map((id) => {
    const aC = a[id]
    const bC = b[id]

    const relayerMatch = aC.relayer === bC.relayer
    const oracleMatch = aC.oracle === bC.oracle
    const inboundMatch =
      aC.inboundProofLibraryVersion === bC.inboundProofLibraryVersion
    const outboundMatch = aC.outboundProofType === bC.outboundProofType

    return {
      chainId: ChainId(id),
      match: relayerMatch && oracleMatch && inboundMatch && outboundMatch,
    }
  })

  return results
}
