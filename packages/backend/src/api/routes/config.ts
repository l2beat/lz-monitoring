import Router from '@koa/router'

import { ConfigController } from '../controllers/config/ConfigController'

export function createConfigRouter(configController: ConfigController): Router {
  const router = new Router()

  router.get('/config/chains', (ctx): void => {
    const data = configController.getChainConfigs()

    ctx.body = data
  })

  return router
}
