import { Logger } from '@l2beat/backend-tools'

import { getTestnetServer } from './server'
import { PRIVATE_KEYS } from './utils/wallets'

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

async function main() {
  const server = getTestnetServer(Logger.INFO)({
    wallet: {
      lock: true,
      accounts: PRIVATE_KEYS.map((secretKey) => ({
        balance: 10_000n * 10n ** 18n,
        secretKey,
      })),
    },
    port: 8000,
  })

  await server.boot()

  process.on('SIGINT', () => {
    void server.destroy()
  })
}
