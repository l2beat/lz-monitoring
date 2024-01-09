import { Logger } from '@l2beat/backend-tools'
import ganache from 'ganache'

import { NodeConfiguration } from './config'

export { getTestnetServer }

function getTestnetServer(logger: Logger) {
  return function (options: NodeConfiguration) {
    const testnetLogger = logger.for('LocalTestnet')
    const server = ganache.server(options)

    const { provider } = server

    async function boot() {
      await server.listen(options.port)
      testnetLogger.info('Listening', { port: options.port })
    }

    async function destroy() {
      await server.close()
      testnetLogger.info('Destroyed')
    }

    return {
      boot,
      destroy,
      provider,
    }
  }
}
