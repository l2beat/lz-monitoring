import Router from '@koa/router'

import { DiscoveryController } from '../controllers/discovery/DiscoveryController'

export function createDiscoveryRouter(
  discoveryController: DiscoveryController,
): Router {
  const router = new Router()

  router.get('/discovery/raw', async (ctx): Promise<void> => {
    const data = await discoveryController.getRawDiscovery()

    if (!data) {
      ctx.status = 404
      return
    }

    ctx.body = data
  })

  router.get('/discovery', async (ctx): Promise<void> => {
    const data = await discoveryController.getDiscovery()

    if (!data) {
      ctx.status = 404
      return
    }

    ctx.body = data
  })

  return router
}
