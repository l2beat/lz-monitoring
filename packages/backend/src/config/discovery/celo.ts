import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'
import { CoreAddressesV1, CoreAddressesV2, LayerZeroAddresses } from '../types'

export { celoChangelogWhitelist, celoDiscoveryConfig, celoEventsToWatch }

const coreAddressesV1 = {
  ultraLightNodeV2: '0x377530cdA84DFb2673bF4d145DCF0C4D7fdcB5b6',
  endpoint: '0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9',
  // No multisig
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0xc80233ad8251e668becbc3b0415707fc7075501e',
  send302: '0x42b4e9c6495b4cfdae024b1ec32e09f28027620e',
  receive301: '0x556d7664d5b4Db11f381c714B6b47A8Bf0b494FD',
  receive302: '0xaDDed4478B423d991C21E525Cd3638FBce1AaD17',
} satisfies CoreAddressesV2

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
} satisfies LayerZeroAddresses

const celoRawConfig = createConfigFromTemplate({
  chain: ChainId.CELO,
  addresses,
})

const celoDiscoveryConfig = new DiscoveryConfig(celoRawConfig)
const celoEventsToWatch = getEventsToWatch(addresses)
const celoChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
