import { Logger } from '@l2beat/backend-tools'
import ganache from 'ganache'

import { NodeConfiguration } from './config'

export { getTestnet }

function getTestnet(logger: Logger) {
  return function (options: NodeConfiguration) {
    const testnetLogger = logger.for('LOCAL TESTNET')
    const server = ganache.server(options)

    async function boot() {
      await server.listen(options.port)
      testnetLogger.info('Listening', { port: options.port })
    }

    async function destroy() {
      await server.close()
      testnetLogger.info('Destroyed')
    }

    const { provider } = server

    return {
      boot,
      destroy,
      provider,
    }
  }
}
