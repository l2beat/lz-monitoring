import { getEnv } from '@l2beat/backend-tools'

import { Application } from './Application'
import { getConfig } from './config'

main().catch((e) => {
  console.error(e)
})

async function main(): Promise<void> {
  const env = getEnv()
  const config = getConfig(env)
  const app = new Application(config)
  await app.start()
}
