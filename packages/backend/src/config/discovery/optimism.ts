import { DiscoveryConfig, getMulticall3Config } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import {
  createConfigFromTemplate,
  getEventsToWatch,
  toEthereumAddresses,
} from '../discoveryConfig'
import {
  AdditionalAddresses,
  CoreAddressesV1,
  CoreAddressesV2,
  LayerZeroAddresses,
} from '../types'

export {
  optimismChangelogWhitelist,
  optimismDiscoveryConfig,
  optimismEventsToWatch,
  optimismMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0x2458BAAbfb21aE1da11D9dD6AD4E48aB2fBF9959',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x3823094993190fbb3bfabfec8365b8c18517566f',
  send302: '0x1322871e4ab09bc7f5717189434f97bbd9546e95',
  receive301: '0x6C9AE31DFB56699d6bD553146f653DCEC3b174Fe',
  receive302: '0x3c4962Ff6258dcfCafD23a814237B7d6Eb712063',
} satisfies CoreAddressesV2

const additionalAddresses = {
  stargateBridge: '0x701a95707A0290AC8B90b3719e8EE5b210360883',
  stargateToken: '0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97',
} satisfies AdditionalAddresses

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
  ...additionalAddresses,
} satisfies LayerZeroAddresses

const optimismRawConfig = createConfigFromTemplate({
  chain: ChainId.OPTIMISM,
  addresses,
})

const optimismDiscoveryConfig = new DiscoveryConfig(optimismRawConfig)
const optimismEventsToWatch = getEventsToWatch(addresses)
const optimismChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
const optimismMulticallConfig = getMulticall3Config(4286263)
