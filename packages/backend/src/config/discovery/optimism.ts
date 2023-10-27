import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate, getEventsToWatch } from '../discoveryConfig'

export { optimismDiscoveryConfig, optimismEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0x2458BAAbfb21aE1da11D9dD6AD4E48aB2fBF9959',
}

const optimismRawConfig = createConfigFromTemplate({
  chain: ChainId.OPTIMISM,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // UltraLightNodeV2
  ],
  addresses,
})

const optimismDiscoveryConfig = new DiscoveryConfig(optimismRawConfig)
const optimismEventsToWatch = getEventsToWatch(addresses)
