import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../../discoveryConfig'

export { goerliChangelogWhitelist, goerliDiscoveryConfig, goerliEventsToWatch }

const addresses = {
  // V1
  ultraLightNodeV2: '0x6f3a314C1279148E53f51AF154817C3EF2C827B1',
  endpoint: '0xbfD2135BFfbb0B5378b56643c2Df8a87552Bfa23',
  // V2
  endpointV2: '0x464570adA09869d8741132183721B4f0769a0287',
  send301: '0xf0e25d92b9e5ef8d3982f430a8d061a18809cd9c',
  receive301: '0x94c1483aecef5d1402f9b14ffb29baf91af53bbd',
  send302: '0xb3f5e2ae7a0a7c4abc809730d8e5699020f466ef',
  receive302: '0xfa824de09da4a013e3bb7be7941af87b9481b869',
}

const goerliRawConfig = createConfigFromTemplate({
  // FIXME: change once discovery support testnet
  chain: ChainId.ETHEREUM,
  addresses,
})

const goerliEventsToWatch = getEventsToWatch(addresses)

const goerliDiscoveryConfig = new DiscoveryConfig(goerliRawConfig)

const goerliChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
  addresses.endpointV2,
  addresses.send301,
  addresses.receive301,
  addresses.send302,
  addresses.receive302,
])
