import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export {
  polygonZkEvmChangelogWhitelist,
  polygonZkEvmDiscoveryConfig,
  polygonZkEvmEventsToWatch,
}

const addresses = {
  ultraLightNodeV2: '0xFe7C30860D01e28371D40434806F4A8fcDD3A098',
  endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
  // No multisig
}

const polygonZkEvmRawConfig = createConfigFromTemplate({
  chain: ChainId.POLYGON_ZKEVM,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const polygonZkEvmDiscoveryConfig = new DiscoveryConfig(polygonZkEvmRawConfig)
const polygonZkEvmEventsToWatch = getEventsToWatch(addresses)
const polygonZkEvmChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
])
