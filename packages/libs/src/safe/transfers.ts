import { z } from 'zod'

export { CommonTransfer, ERC20Transfer, EtherTransfer }

const CommonTransfer = z.object({
  value: z.string(),
  transferId: z.string(),
  transactionHash: z.string().nullish(),
  from: z.string(),
  to: z.string(),
  blockNumber: z.number(),
  executionDate: z.string().nullish(),
})

const EtherTransfer = z
  .object({
    type: z.literal('ETHER_TRANSFER'),
  })
  .merge(CommonTransfer)

const ERC20Transfer = z
  .object({
    type: z.literal('ERC20_TRANSFER'),
    tokenAddress: z.string(),
    tokenInfo: z.object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
      type: z.string().nullish(),
      logoUri: z.string().nullish(),
    }),
  })
  .merge(CommonTransfer)

type EtherTransfer = z.infer<typeof EtherTransfer>
type ERC20Transfer = z.infer<typeof ERC20Transfer>
type CommonTransfer = z.infer<typeof CommonTransfer>
