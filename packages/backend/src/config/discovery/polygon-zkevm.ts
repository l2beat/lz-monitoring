import { DiscoveryConfig, getMulticall3Config } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'
import { CoreAddressesV1, CoreAddressesV2, LayerZeroAddresses } from '../types'

export {
  polygonZkEvmChangelogWhitelist,
  polygonZkEvmDiscoveryConfig,
  polygonZkEvmEventsToWatch,
  polygonZkEvmMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0xFe7C30860D01e28371D40434806F4A8fcDD3A098',
  endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
  // No multisig
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x8161b3b224cd6ce37cc20be61607c3e19ec2a8a6',
  send302: '0x28b6140ead70cb2fb669705b3598ffb4beaa060b',
  receive301: '0x23ec43e2b8f9aE21D895eEa5a1a9c444fe301044',
  receive302: '0x581b26F362AD383f7B51eF8A165Efa13DDe398a4',
} satisfies CoreAddressesV2

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
} satisfies LayerZeroAddresses

const polygonZkEvmRawConfig = createConfigFromTemplate({
  chain: ChainId.POLYGON_ZKEVM,
  addresses,
})

const polygonZkEvmDiscoveryConfig = new DiscoveryConfig(polygonZkEvmRawConfig)

const polygonZkEvmEventsToWatch = getEventsToWatch(addresses)

const polygonZkEvmChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
const polygonZkEvmMulticallConfig = getMulticall3Config(57746)
