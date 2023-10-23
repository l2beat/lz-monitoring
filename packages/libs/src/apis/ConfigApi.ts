import { z } from 'zod'

import { ChainId } from '../chainId'
import { branded } from '../utils'

export { ChainModuleConfig, ChainModuleConfigsResponse }

const ChainModuleConfig = z.object({
  chainId: branded(z.number(), ChainId),
  enabled: z.boolean(),
})

type ChainModuleConfig = z.infer<typeof ChainModuleConfig>

const ChainModuleConfigsResponse = z.array(ChainModuleConfig)
type ChainModuleConfigsResponse = z.infer<typeof ChainModuleConfigsResponse>
