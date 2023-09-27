import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { celoDiscoveryConfig }

const celoRawConfig = createConfigFromTemplate({
  chain: ChainId.CELO,
  initialAddresses: [
    '0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9', // UltraLightNodeV2
  ],
  addresses: {
    ultraLightNodeV2: '0x38dE71124f7a447a01D67945a51eDcE9FF491251', // FIXME: Not sure
    endpoint: '0x3A73033C0b1407574C76BdBAc67f126f6b4a9AA9',
    layerZeroMultisig: '0x28937ca4873f7289Ebea0708c4E42b24835eCfF0', // FIXME: Not sure
  },
})

const celoDiscoveryConfig = new DiscoveryConfig(celoRawConfig)
