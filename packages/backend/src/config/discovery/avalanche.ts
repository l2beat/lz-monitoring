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
  avalancheChangelogWhitelist,
  avalancheDiscoveryConfig,
  avalancheEventsToWatch,
  avalancheMulticallConfig,
}

const coreAddressesV1 = {
  ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
  endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
  layerZeroMultisig: '0xcE958C3Fb6fbeCAA5eef1E4dAbD13418bc1ba483',
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x31cae3b7fb82d847621859fb1585353c5720660d',
  send302: '0x197d1333dea5fe0d6600e9b396c7f1b1cfcc558a',
  receive301: '0xF85eD5489E6aDd01Fec9e8D53cF8FAcFc70590BD',
  receive302: '0xbf3521d309642FA9B1c91A08609505BA09752c61',
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

const avalancheRawConfig = createConfigFromTemplate({
  chain: ChainId.AVALANCHE,
  addresses,
})

const avalancheDiscoveryConfig = new DiscoveryConfig(avalancheRawConfig)
const avalancheEventsToWatch = getEventsToWatch(addresses)
const avalancheChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
const avalancheMulticallConfig = getMulticall3Config(11907934)
