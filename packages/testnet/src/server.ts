import { Logger } from '@l2beat/backend-tools'
import Ganache from 'ganache'

import { NodeConfiguration } from './config'

export { getTestnet }

function getTestnet(logger: Logger) {
  return function (options: NodeConfiguration) {
    const testnetLogger = logger.for('LOCAL TESTNET')
    const server = Ganache.server(options)
    const { provider } = server

    async function boot() {
      await server.listen(options.port)
      testnetLogger.info('Listening', { port: options.port })
    }

    async function destroy() {
      await server.close()
      testnetLogger.info('Destroyed')
    }

    // async function mine(opts?: GanacheType.Ethereum.MineOptions) {
    //   await provider.request({ method: 'evm_mine', params: opts ? [opts] : [] })
    // }

    return {
      // mine,
      boot,
      destroy,
      provider,
    }
  }
}
