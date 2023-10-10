import { z } from 'zod'

export { DataDecoded, ParamDecoded, SubParamDecoded }

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

type ParamDecoded = z.infer<typeof ParamDecoded>
const ParamDecoded = z.object({
  name: z.string(),
  type: z.string(),
  value: PrimitiveValue,
  valueDecoded: z.optional(z.array(SubParamDecoded)),
})

type DataDecoded = z.infer<typeof DataDecoded>
const DataDecoded = z
  .object({
    method: z.string(),
    parameters: z.array(ParamDecoded),
  })
  .nullable()
