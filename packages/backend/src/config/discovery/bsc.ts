import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export { bscChangelogWhitelist, bscDiscoveryConfig, bscEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0x8D452629c5FfCDDE407069da48c096e1F8beF22c',
}

const bscRawConfig = createConfigFromTemplate({
  chain: ChainId.BSC,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const bscDiscoveryConfig = new DiscoveryConfig(bscRawConfig)
const bscEventsToWatch = getEventsToWatch(addresses)
const bscChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
  addresses.layerZeroMultisig,
])
