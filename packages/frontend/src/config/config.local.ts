import { ChainId } from '@lz/libs'

import { Config } from './Config'

export function getLocalConfig(): Config {
  return {
    apiUrl: 'http://localhost:3000/',
    availableChains: [
      ChainId.ETHEREUM,
      ChainId.ARBITRUM,
      ChainId.OPTIMISM,
      ChainId.POLYGON_POS,
      ChainId.POLYGON_ZKEVM,
      ChainId.BASE,
      ChainId.AVALANCHE,
      ChainId.BSC,
      ChainId.LINEA,
    ],
  }
}
