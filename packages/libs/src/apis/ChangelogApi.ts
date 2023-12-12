import { z } from 'zod'

import { branded, Hash256, UnixTime } from '../utils'

const ObjectModification = z.union([
  z.literal('OBJECT_NEW_PROPERTY'),
  z.literal('OBJECT_DELETED_PROPERTY'),
  z.literal('OBJECT_EDITED_PROPERTY'),
])
const ArrayModification = z.union([
  z.literal('ARRAY_NEW_ELEMENT'),
  z.literal('ARRAY_DELETED_ELEMENT'),
  z.literal('ARRAY_EDITED_ELEMENT'),
])

const ModificationType = z.union([ObjectModification, ArrayModification])
export type ModificationType = z.infer<typeof ModificationType>

const ChangelogCategory = z.union([
  z.literal('CONTRACT_ADDED'),
  z.literal('REMOTE_ADDED'),
  z.literal('REMOTE_CHANGED'),
  z.literal('OTHER'),
])
export type ChangelogCategory = z.infer<typeof ChangelogCategory>

// TODO: remove this
export const ChangelogSummary = z.object({
  count: z.number(),
  lastChangeTimestamp: z.nullable(branded(z.number(), (t) => new UnixTime(t))),
})
export type ChangelogSummary = z.infer<typeof ChangelogSummary>

export const Change = z.object({
  group: z.union([z.number(), z.literal('other')]),
  modificationType: ModificationType,
  parameterPath: z.array(z.string()),
  previousValue: z.nullable(z.string()),
  currentValue: z.nullable(z.string()),
  category: ChangelogCategory,
})
export type Change = z.infer<typeof Change>

export const Milestone = z.object({
  operation: z.union([
    z.literal('CONTRACT_ADDED'),
    z.literal('CONTRACT_REMOVED'),
  ]),
})
export type Milestone = z.infer<typeof Milestone>

export const ChangelogApiEntry = z.object({
  timestamp: branded(z.number(), (t) => new UnixTime(t)),
  blockNumber: z.number(),
  possibleTxHashes: z.array(branded(z.string(), Hash256)),
  changes: z.array(Change),
})
export type ChangelogApiEntry = z.infer<typeof ChangelogApiEntry>

export const ChangelogApi = z.object({
  perDay: z.array(
    z.object({
      timestamp: branded(z.number(), (t) => new UnixTime(t)),
      perBlock: z.array(ChangelogApiEntry),
    }),
  ),
  availableYears: z.array(z.number()),
  startTimestamp: branded(z.number(), (t) => new UnixTime(t)),
})
export type ChangelogApi = z.infer<typeof ChangelogApi>
