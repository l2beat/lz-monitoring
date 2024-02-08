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
  arbitrumChangelogWhitelist,
  arbitrumDiscoveryConfig,
  arbitrumEventsToWatch,
  arbitrumMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xFE22f5D2755b06b9149656C5793Cb15A08d09847',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x5cdc927876031b4ef910735225c425a7fc8efed9',
  send302: '0x975bcd720be66659e3eb3c0e4f1866a3020e493a',
  receive301: '0xe4DD168822767C4342e54e6241f0b91DE0d3c241',
  receive302: '0x7B9E184e07a6EE1aC23eAe0fe8D6Be2f663f05e6',
} satisfies CoreAddressesV2

const additionalAddresses = {
  stargateBridge: '0x352d8275AAE3e0c2404d9f68f6cEE084B5bEB3DD',
  stargateToken: '0x6694340fc020c5E6B96567843da2df01b2CE1eb6',
} satisfies AdditionalAddresses

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
  ...additionalAddresses,
} satisfies LayerZeroAddresses

const arbitrumRawConfig = createConfigFromTemplate({
  chain: ChainId.ARBITRUM,
  addresses,
})

const arbitrumDiscoveryConfig = new DiscoveryConfig(arbitrumRawConfig)
const arbitrumEventsToWatch = getEventsToWatch(addresses)
const arbitrumChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])

const arbitrumMulticallConfig = getMulticall3Config(7654707)
