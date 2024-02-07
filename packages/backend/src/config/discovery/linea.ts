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

export { lineaChangelogWhitelist, lineaDiscoveryConfig, lineaEventsToWatch }

const coreAddressesV1 = {
  ultraLightNodeV2: '0x38de71124f7a447a01d67945a51edce9ff491251',
  endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
  // No multisig
} satisfies CoreAddressesV1

const coreAddressesV2 = {
  endpointV2: '0x1a44076050125825900e736c501f859c50fe728c',
  send301: '0x119c04c4e60158fa69ecf4cddf629d09719a7572',
  send302: '0x32042142dd551b4ebe17b6fed53131dd4b4eea06',
  receive301: '0x443CAa8CD23D8CC1e04B3Ce897822AEa6ad3EbDA',
  receive302: '0xE22ED54177CE1148C557de74E4873619e6c6b205',
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

const lineaRawConfig = createConfigFromTemplate({
  chain: ChainId.LINEA,
  addresses,
})

const lineaDiscoveryConfig = new DiscoveryConfig(lineaRawConfig)
const lineaEventsToWatch = getEventsToWatch(addresses)
const lineaChangelogWhitelist = toEthereumAddresses([
  ...Object.values(coreAddressesV1),
  ...Object.values(coreAddressesV2),
])
