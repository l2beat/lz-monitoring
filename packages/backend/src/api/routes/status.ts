import Router from '@koa/router'

import { StatusController } from '../controllers/StatusController'

export function createStatusRouter(statusController: StatusController): Router {
  const router = new Router()

  router.get('/status/discovery', async (ctx): Promise<void> => {
    const data = await statusController.getStatus()

    ctx.body = data
  })

  return router
}
