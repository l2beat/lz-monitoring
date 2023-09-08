import Router from '@koa/router'

import { HealthController } from '../controllers/HealthController'

export function createHealthRouter(healthController: HealthController): Router {
  const router = new Router()

  router.get('/health', (ctx): void => {
    const data = healthController.getStatus()

    ctx.body = data
  })

  return router
}
