import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { polygonZkEvmDiscoveryConfig }

const polygonZkEvmRawConfig = createConfigFromTemplate({
  chain: ChainId.POLYGON_ZKEVM,
  initialAddresses: [
    '0xFe7C30860D01e28371D40434806F4A8fcDD3A098', // UltraLightNodeV2
  ],
  addresses: {
    ultraLightNodeV2: '0xFe7C30860D01e28371D40434806F4A8fcDD3A098',
    endpoint: '0x9740FF91F1985D8d2B71494aE1A2f723bb3Ed9E4',
    // No multisig
  },
})

const polygonZkEvmDiscoveryConfig = new DiscoveryConfig(polygonZkEvmRawConfig)
