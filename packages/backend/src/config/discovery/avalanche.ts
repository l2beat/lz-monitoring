import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export {
  avalancheChangelogWhitelist,
  avalancheDiscoveryConfig,
  avalancheEventsToWatch,
}

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xcE958C3Fb6fbeCAA5eef1E4dAbD13418bc1ba483',
}

const avalancheRawConfig = createConfigFromTemplate({
  chain: ChainId.AVALANCHE,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const avalancheDiscoveryConfig = new DiscoveryConfig(avalancheRawConfig)
const avalancheEventsToWatch = getEventsToWatch(addresses)
const avalancheChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
])
