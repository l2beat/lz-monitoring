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
  stargateBridge: '0x6694340fc020c5E6B96567843da2df01b2CE1eb6',
  stargateToken: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
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
