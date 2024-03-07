import Router from '@koa/router'
import { ChainId, stringAs } from '@lz/libs'
import { z } from 'zod'

import { withTypedContext } from '../../api/routes/typedContext'
import { TrackingController } from './TrackingController'

export { createTrackingRouter }

function createTrackingRouter(trackingController: TrackingController): Router {
  const router = new Router()

  router.get(
    '/tracking/:chainId',
    withTypedContext(
      z.object({
        params: z.object({ chainId: stringAs((s) => ChainId.fromName(s)) }),
      }),
      async (ctx): Promise<void> => {
        const data = await trackingController.getOApps(ctx.params.chainId)

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
