import { ServerOptions } from 'ganache'

export type { NodeConfiguration }

interface NodeConfiguration extends ServerOptions {
  port: number
  unlockedAccounts?: string[]
}
