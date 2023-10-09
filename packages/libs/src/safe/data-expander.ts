import { z } from 'zod'

export { DataDecoded, ParamDecoded, SubParamDecoded }

type SubParamDecoded = z.infer<typeof SubParamDecoded>
const SubParamDecoded = z.object({
  operation: z.number(),
  to: z.string(),
  value: z.string(),
  data: z.string(),
  dataDecoded: z.optional(
    z.object({
      method: z.string(),
      parameters: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          value: z.string(),
        }),
      ),
    }),
  ),
})

type ParamDecoded = z.infer<typeof ParamDecoded>
const ParamDecoded = z.object({
  name: z.string(),
  type: z.string(),
  value: z.string(),
  valueDecoded: z.optional(z.array(SubParamDecoded)),
})

type DataDecoded = z.infer<typeof DataDecoded>
const DataDecoded = z.object({
  method: z.string(),
  parameters: z.array(ParamDecoded),
})
