import { z } from 'zod'

import { ChainId } from '../chainId/ChainId'
import { Hash256, UnixTime } from '../utils'
import { branded } from '../utils/branded'

export type { DiscoveryStatus }

const DiscoveryStatus = z.object({
  chainName: z.string(),
  chainId: branded(z.number(), ChainId),
  node: z.object({
    blockNumber: z.number(),
    blockTimestamp: z.number(),
  }),
  lastIndexedBlock: z
    .object({
      timestamp: branded(z.number(), (t) => new UnixTime(t)),
      blockNumber: z.number(),
      blockHash: branded(z.string(), Hash256),
      chainId: branded(z.number(), ChainId),
    })
    .nullable(),
  lastDiscoveredBlock: z.number().nullable(),
  indexerStates: z.array(
    z.object({
      id: z.string(),
      height: z.number(),
      chainId: branded(z.number(), ChainId),
    }),
  ),
  delay: z.object({
    discovery: z.number().nullable(),
    blocks: z.number().nullable(),
    offset: z.number().nullable(),
  }),
})

type DiscoveryStatus = z.infer<typeof DiscoveryStatus>
