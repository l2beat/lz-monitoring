import { z } from 'zod'

import { branded, UnixTime } from '../utils'

export const ChangelogSummary = z.object({
  count: z.number(),
  lastChangeTimestamp: z.nullable(branded(z.number(), (t) => new UnixTime(t))),
})
export type ChangelogSummary = z.infer<typeof ChangelogSummary>
