import { DiscoveryConfig } from '@l2beat/discovery'
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
  polygonPosChangelogWhitelist,
  polygonPosDiscoveryConfig,
  polygonPosEventsToWatch,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xF1a5F92F5F89e8b539136276f827BF1648375312',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x5727e81a40015961145330d91cc27b5e189ff3e1',
  send302: '0x6c26c61a97006888ea9e4fa36584c7df57cd9da3',
  receive301: '0x3823094993190Fbb3bFABfEC8365b8C18517566F',
  receive302: '0x1322871e4ab09Bc7f5717189434f97bBD9546e95',
} satisfies CoreAddressesV2

const additionalAddresses = {
  stargateBridge: '0x9d1B1669c73b033DFe47ae5a0164Ab96df25B944',
  stargateToken: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
} satisfies AdditionalAddresses

const addresses = {
  ...coreAddressesV1,
  ...coreAddressesV2,
  ...additionalAddresses,
} satisfies LayerZeroAddresses

const polygonPosRawConfig = createConfigFromTemplate({
  chain: ChainId.POLYGON_POS,
  addresses,
})

const polygonPosDiscoveryConfig = new DiscoveryConfig(polygonPosRawConfig)
const polygonPosEventsToWatch = getEventsToWatch(addresses)
const polygonPosChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
