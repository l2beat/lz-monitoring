import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export { baseChangelogWhitelist, baseDiscoveryConfig, baseEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x38dE71124f7a447a01D67945a51eDcE9FF491251',
  endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
  layerZeroMultisig: '0x28937ca4873f7289Ebea0708c4E42b24835eCfF0',
}

const baseRawConfig = createConfigFromTemplate({
  chain: ChainId.BASE,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const baseDiscoveryConfig = new DiscoveryConfig(baseRawConfig)
const baseEventsToWatch = getEventsToWatch(addresses)
const baseChangelogWhitelist = toEthereumAddresses([
  addresses.endpoint,
  addresses.ultraLightNodeV2,
  addresses.layerZeroMultisig,
])
