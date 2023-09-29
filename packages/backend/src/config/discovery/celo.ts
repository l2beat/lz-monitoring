import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { celoDiscoveryConfig }

const celoRawConfig = createConfigFromTemplate({
  chain: ChainId.CELO,
  initialAddresses: [
    '0x377530cdA84DFb2673bF4d145DCF0C4D7fdcB5b6', // UltraLightNodeV2
  ],
  addresses: {
    ultraLightNodeV2: '0x377530cdA84DFb2673bF4d145DCF0C4D7fdcB5b6',
    endpoint: '0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9',
    // No multisig support (check with LZ team)
  },
})

const celoDiscoveryConfig = new DiscoveryConfig(celoRawConfig)
