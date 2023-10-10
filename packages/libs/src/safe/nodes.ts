import { SupportedSafeChainIds } from './endpoints'

export { publicNodeEndpoints }

const publicNodeEndpoints: Record<SupportedSafeChainIds, string> = {
  1: 'https://rpc.ankr.com/eth',
  42161: 'https://rpc.ankr.com/arbitrum',
  10: 'https://rpc.ankr.com/optimism',
  56: 'https://rpc.ankr.com/bsc',
  43114: 'https://rpc.ankr.com/avalanche',
  42220: 'https://rpc.ankr.com/celo',
  8453: 'https://mainnet.base.org',
  100: 'https://rpc.ankr.com/gnosis',
  137: 'https://rpc.ankr.com/polygon',
}
