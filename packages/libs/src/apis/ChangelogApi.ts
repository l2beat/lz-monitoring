import { z } from 'zod'

import { branded, UnixTime } from '../utils'

export const ChangelogSummary = z.object({
  count: z.number(),
  lastChangeTimestamp: z.nullable(branded(z.number(), (t) => new UnixTime(t))),
})
export type ChangelogSummary = z.infer<typeof ChangelogSummary>

export const ChangelogApiEntry = z.object({
  timestamp: branded(z.number(), (t) => new UnixTime(t)),
  blockNumber: z.number(),
  // transactionHash: branded(z.string(), Hash256),
  changes: z.array(
    z.object({
      parameterPath: z.array(z.string()),
      previousValue: z.nullable(z.string()),
      currentValue: z.nullable(z.string()),
    }),
  ),
})
export type ChangelogApiEntry = z.infer<typeof ChangelogApiEntry>

export const ChangelogApi = z.array(ChangelogApiEntry)
export type ChangelogApi = z.infer<typeof ChangelogApi>
