import Router from '@koa/router'
import { ChainId, EthereumAddress, stringAs } from '@lz/libs'
import { z } from 'zod'

import { ChangelogController } from '../controllers/ChangelogController'
import { withTypedContext } from './typedContext'

export function createChangelogRouter(
  changelogController: ChangelogController,
): Router {
  const router = new Router()

  router.get(
    '/changelog/:chainId/:contract',
    withTypedContext(
      z.object({
        params: z.object({
          chainId: stringAs((s) => ChainId.fromName(s)),
          // todo: maybe contract name?
          contract: stringAs((s) => EthereumAddress(s)),
        }),
      }),
      async (ctx): Promise<void> => {
        const data = await changelogController.getChangelog(
          ctx.params.chainId,
          ctx.params.contract,
        )
        ctx.body = data
      },
    ),
  )

  return router
}
