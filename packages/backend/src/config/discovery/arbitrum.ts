import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export {
  arbitrumChangelogWhitelist,
  arbitrumDiscoveryConfig,
  arbitrumEventsToWatch,
}

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xFE22f5D2755b06b9149656C5793Cb15A08d09847',
}

const arbitrumRawConfig = createConfigFromTemplate({
  chain: ChainId.ARBITRUM,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const arbitrumDiscoveryConfig = new DiscoveryConfig(arbitrumRawConfig)
const arbitrumEventsToWatch = getEventsToWatch(addresses)
const arbitrumChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
])
