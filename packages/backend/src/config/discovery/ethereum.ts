import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { ethereumDiscoveryConfig }

const ethereumRawConfig = createConfigFromTemplate({
  chain: ChainId.ETHEREUM,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // STG
  ],
  addresses: {
    ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
    endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    layerZeroMultisig: '0xCDa8e3ADD00c95E5035617F970096118Ca2F4C92',
  },
})

const ethereumDiscoveryConfig = new DiscoveryConfig(ethereumRawConfig)
