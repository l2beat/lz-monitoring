import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { bscDiscoveryConfig }

const bscRawConfig = createConfigFromTemplate({
  chain: ChainId.BSC,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // UltraLightNodeV2
  ],
  addresses: {
    ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
    endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    layerZeroMultisig: '0x8D452629c5FfCDDE407069da48c096e1F8beF22c',
  },
})

const bscDiscoveryConfig = new DiscoveryConfig(bscRawConfig)
