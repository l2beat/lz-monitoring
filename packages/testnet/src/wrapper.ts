import { Logger } from '@l2beat/backend-tools'

import { NodeConfiguration } from './config'
import { getTestnetServer } from './server'
import { attachBlockchainUtils } from './utils/blockchain'
import { getEthersProvider, setupEthersWallets } from './utils/provider'
import { PRIVATE_KEYS } from './utils/wallets'

export { getTestnet }

function getTestnet(logger: Logger) {
  return function (options: NodeConfiguration) {
    const mergedOptions: NodeConfiguration = {
      wallet: {
        lock: true,
        accounts: PRIVATE_KEYS.map((secretKey) => ({
          balance: 10_000n * 10n ** 18n,
          secretKey,
        })),
      },
      logging: {
        quiet: true,
      },
      ...options,
    }

    const ganacheServer = getTestnetServer(logger)(mergedOptions)

    const ganacheProvider = ganacheServer.provider
    const ethersProvider = getEthersProvider(ganacheProvider)
    const ethersWallets = setupEthersWallets(ethersProvider)

    const providers = {
      ganache: ganacheProvider,
      ethers: getEthersProvider(ganacheProvider),
    }

    const wallets = {
      ethers: ethersWallets,
    }

    const server = {
      boot: ganacheServer.boot,
      destroy: ganacheServer.destroy,
    }

    const utils = attachBlockchainUtils(ganacheProvider)

    return {
      server,
      wallets,
      providers,
      utils,
    }
  }
}
