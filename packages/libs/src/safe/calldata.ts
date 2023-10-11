import { z } from 'zod'

export { SafeTransactionDecodedData, SafeTransactionDecodedParam }

const PrimitiveValue = z.string().or(z.array(z.string()))
type PrimitiveValue = z.infer<typeof PrimitiveValue>

type SubParamDecoded = z.infer<typeof SubParamDecoded>
const SubParamDecoded = z.object({
  operation: z.number(),
  to: z.string(),
  value: PrimitiveValue,
  data: z.string(),
  dataDecoded: z
    .object({
      method: z.string(),
      parameters: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          value: PrimitiveValue,
        }),
      ),
    })
    .nullable(),
})

type SafeTransactionDecodedParam = z.infer<typeof SafeTransactionDecodedParam>
const SafeTransactionDecodedParam = z.object({
  name: z.string(),
  type: z.string(),
  value: PrimitiveValue,
  valueDecoded: z.optional(z.array(SubParamDecoded)),
})

type SafeTransactionDecodedData = z.infer<typeof SafeTransactionDecodedData>
const SafeTransactionDecodedData = z
  .object({
    method: z.string(),
    parameters: z.array(SafeTransactionDecodedParam),
  })
  .nullable()
