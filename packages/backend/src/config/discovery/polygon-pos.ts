import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate, getEventsToWatch } from '../discoveryConfig'

export { polygonPosDiscoveryConfig, polygonPosEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xF1a5F92F5F89e8b539136276f827BF1648375312',
}

const polygonPosRawConfig = createConfigFromTemplate({
  chain: ChainId.POLYGON_POS,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // UltraLightNodeV2
  ],
  addresses,
})

const polygonPosDiscoveryConfig = new DiscoveryConfig(polygonPosRawConfig)
const polygonPosEventsToWatch = getEventsToWatch(addresses)
