import { ServerOptions } from 'ganache'

export type { NodeConfiguration }

interface NodeConfiguration extends ServerOptions {
  silent: boolean
  port: number
}
