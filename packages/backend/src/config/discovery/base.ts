import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  CoreAddressesV1,
  CoreAddressesV2,
  createConfigFromTemplate,
  getEventsToWatch,
  LayerZeroAddresses,
  toEthereumAddresses,
} from '../discoveryConfig'

export { baseChangelogWhitelist, baseDiscoveryConfig, baseEventsToWatch }

const coreAddressesV1 = {
  ultraLightNodeV2: '0x38dE71124f7a447a01D67945a51eDcE9FF491251',
  endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
  layerZeroMultisig: '0x28937ca4873f7289Ebea0708c4E42b24835eCfF0',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x9db3714048b5499ec65f807787897d3b3aa70072',
  send302: '0xb5320b0b3a13cc860893e2bd79fcd7e13484dda2',
  receive301: '0x58D53a2d6a08B72a15137F3381d21b90638bd753',
  receive302: '0xc70AB6f32772f59fBfc23889Caf4Ba3376C84bAf',
} satisfies CoreAddressesV2

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
} satisfies LayerZeroAddresses

const baseRawConfig = createConfigFromTemplate({
  chain: ChainId.BASE,
  addresses,
})

const baseDiscoveryConfig = new DiscoveryConfig(baseRawConfig)
const baseEventsToWatch = getEventsToWatch(addresses)
const baseChangelogWhitelist = toEthereumAddresses([
  addresses.endpoint,
  addresses.ultraLightNodeV2,
  addresses.layerZeroMultisig,
])
