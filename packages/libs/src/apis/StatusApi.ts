import { z } from 'zod'

import { ChainId } from '../chainId/ChainId'
import { Hash256, UnixTime } from '../utils'
import { branded } from '../utils/branded'

export {
  CommonDiscoveryStatus,
  DiscoveryDisabledStatus,
  DiscoveryEnabledStatus,
  DiscoveryStatus,
  DiscoveryStatusResponse,
}

type CommonDiscoveryStatus = z.infer<typeof CommonDiscoveryStatus>

const CommonDiscoveryStatus = z.object({
  visible: z.boolean(),
  chainName: z.string(),
  chainId: branded(z.number(), ChainId),
  lastIndexedBlock: z.nullable(
    z.object({
      timestamp: branded(z.number(), (t) => new UnixTime(t)),
      blockNumber: z.number(),
      blockHash: branded(z.string(), Hash256),
      chainId: branded(z.number(), ChainId),
    }),
  ),
  lastDiscoveredBlock: z
    .object({
      timestamp: branded(z.number(), (t) => new UnixTime(t)),
      blockNumber: z.number(),
    })
    .nullable(),
  indexerStates: z.array(
    z.object({
      id: z.string(),
      height: z.number(),
      chainId: branded(z.number(), ChainId),
    }),
  ),
})

type DiscoveryEnabledStatus = z.infer<typeof DiscoveryEnabledStatus>

const DiscoveryEnabledStatus = z
  .object({
    state: z.literal('enabled'),
    node: z.nullable(
      z.object({
        blockNumber: z.number(),
        blockTimestamp: z.number(),
      }),
    ),
  })
  .merge(CommonDiscoveryStatus)

type DiscoveryDisabledStatus = z.infer<typeof DiscoveryDisabledStatus>

const DiscoveryDisabledStatus = z
  .object({
    state: z.literal('disabled'),
  })
  .merge(CommonDiscoveryStatus)

const DiscoveryStatus = z.discriminatedUnion('state', [
  DiscoveryEnabledStatus,
  DiscoveryDisabledStatus,
])

type DiscoveryStatus = z.infer<typeof DiscoveryStatus>

const DiscoveryStatusResponse = z.array(DiscoveryStatus)

type DiscoveryStatusResponse = z.infer<typeof DiscoveryStatusResponse>
