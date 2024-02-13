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
  ethereumChangelogWhitelist,
  ethereumDiscoveryConfig,
  ethereumEventsToWatch,
  ethereumMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
  layerZeroMultisig: '0xCDa8e3ADD00c95E5035617F970096118Ca2F4C92',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0xD231084BfB234C107D3eE2b22F97F3346fDAF705',
  send302: '0xbB2Ea70C9E858123480642Cf96acbcCE1372dCe1',
  receive301: '0x245B6e8FFE9ea5Fc301e32d16F66bD4C2123eEfC',
  receive302: '0xc02Ab410f0734EFa3F14628780e6e695156024C2',
} satisfies CoreAddressesV2

const additionalAddresses = {
  stargateBridge: '0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97',
  stargateToken: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
} satisfies AdditionalAddresses

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
  ...additionalAddresses,
} satisfies LayerZeroAddresses

const ethereumRawConfig = createConfigFromTemplate({
  chain: ChainId.ETHEREUM,
  addresses,
})

const ethereumDiscoveryConfig = new DiscoveryConfig(ethereumRawConfig)
const ethereumEventsToWatch = getEventsToWatch(addresses)
const ethereumChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])

const ethereumMulticallConfig = getMulticall3Config(14353601)
