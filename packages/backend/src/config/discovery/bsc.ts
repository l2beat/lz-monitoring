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
  bscChangelogWhitelist,
  bscDiscoveryConfig,
  bscEventsToWatch,
  bscMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0x8D452629c5FfCDDE407069da48c096e1F8beF22c',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0xfcce712c9be5a78fe5f842008e0ed7af59455278',
  send302: '0x9f8c645f2d0b2159767bd6e0839de4be49e823de',
  receive301: '0xff3da3a1cd39Bbaeb8D7cB2deB83EfC065CBb38F',
  receive302: '0xB217266c3A98C8B2709Ee26836C98cf12f6cCEC1',
} satisfies CoreAddressesV2

const additionalAddresses = {
  stargateBridge: '0x6694340fc020c5E6B96567843da2df01b2CE1eb6',
  stargateToken: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
} satisfies AdditionalAddresses

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
  ...additionalAddresses,
} satisfies LayerZeroAddresses

const bscRawConfig = createConfigFromTemplate({
  chain: ChainId.BSC,
  addresses,
})

const bscDiscoveryConfig = new DiscoveryConfig(bscRawConfig)
const bscEventsToWatch = getEventsToWatch(addresses)
const bscChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
const bscMulticallConfig = getMulticall3Config(15921452)
