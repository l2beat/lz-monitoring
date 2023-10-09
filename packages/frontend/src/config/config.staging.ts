import { ChainId } from '@lz/libs'

import { Config } from './Config'

export function getStagingConfig(): Config {
  return {
    apiUrl: 'https://lz-monitoring-7eda96cf0a1b.herokuapp.com/',
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
