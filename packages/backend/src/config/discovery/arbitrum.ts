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
  stargateBridge: '0x352d8275AAE3e0c2404d9f68f6cEE084B5bEB3DD',
  stargateToken: '0x6694340fc020c5E6B96567843da2df01b2CE1eb6',
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
  addresses.layerZeroMultisig,
])
