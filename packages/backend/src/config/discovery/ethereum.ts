import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export {
  ethereumChangelogWhitelist,
  ethereumDiscoveryConfig,
  ethereumEventsToWatch,
}

const addresses = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
  layerZeroMultisig: '0xCDa8e3ADD00c95E5035617F970096118Ca2F4C92',
  stargateBridge: '0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97',
  stargateToken: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
}

const ethereumRawConfig = createConfigFromTemplate({
  chain: ChainId.ETHEREUM,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const ethereumDiscoveryConfig = new DiscoveryConfig(ethereumRawConfig)
const ethereumEventsToWatch = getEventsToWatch(addresses)
const ethereumChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
  addresses.layerZeroMultisig,
])
