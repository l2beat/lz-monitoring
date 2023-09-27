import Router from '@koa/router'
import { ChainId, stringAs } from '@lz/libs'
import { z } from 'zod'

import { DiscoveryController } from '../controllers/discovery/DiscoveryController'
import { withTypedContext } from './typedContext'

export function createDiscoveryRouter(
  discoveryController: DiscoveryController,
): Router {
  const router = new Router()

  /**
   * @deprecated
   */
  router.get('/discovery/raw', async (ctx): Promise<void> => {
    const data = await discoveryController.getRawDiscovery(ChainId.ETHEREUM)

    if (!data) {
      ctx.status = 404
      return
    }

    ctx.body = data
  })

  /**
   * @deprecated
   */
  router.get('/discovery', async (ctx): Promise<void> => {
    const data = await discoveryController.getDiscovery(ChainId.ETHEREUM)

    if (!data) {
      ctx.status = 404
      return
    }

    ctx.body = data
  })

  router.get(
    '/discovery/:chainId',
    withTypedContext(
      z.object({
        params: z.object({ chainId: stringAs((s) => ChainId.fromName(s)) }),
      }),
      async (ctx): Promise<void> => {
        const data = await discoveryController.getDiscovery(ctx.params.chainId)

        if (!data) {
          ctx.status = 404
          return
        }

        ctx.body = data
      },
    ),
  )

  router.get(
    '/discovery/raw/:chainId',
    withTypedContext(
      z.object({
        params: z.object({ chainId: stringAs((s) => ChainId.fromName(s)) }),
      }),
      async (ctx): Promise<void> => {
        const data = await discoveryController.getRawDiscovery(
          ctx.params.chainId,
        )

        if (!data) {
          ctx.status = 404
          return
        }

        ctx.body = data
      },
    ),
  )

  return router
}
