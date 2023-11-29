import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'

export { celoChangelogWhitelist, celoDiscoveryConfig, celoEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x377530cdA84DFb2673bF4d145DCF0C4D7fdcB5b6',
  endpoint: '0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9',
  relayer: '0x15e51701F245F6D5bd0FEE87bCAf55B0841451B3',
  // No multisig support (check with LZ team)
}

const celoRawConfig = createConfigFromTemplate({
  chain: ChainId.CELO,
  initialAddresses: [addresses.endpoint, addresses.ultraLightNodeV2],
  addresses,
})

const celoDiscoveryConfig = new DiscoveryConfig(celoRawConfig)
const celoEventsToWatch = getEventsToWatch(addresses)
const celoChangelogWhitelist = toEthereumAddresses([
  addresses.ultraLightNodeV2,
  addresses.endpoint,
])
