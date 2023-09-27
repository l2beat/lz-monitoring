import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate } from '../discoveryConfig'

export { lineaDiscoveryConfig }

const lineaRawConfig = createConfigFromTemplate({
  chain: ChainId.LINEA,
  initialAddresses: [
    '0x38de71124f7a447a01d67945a51edce9ff491251', // UltraLightNodeV2
  ],
  addresses: {
    ultraLightNodeV2: '0x38de71124f7a447a01d67945a51edce9ff491251',
    endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
    layerZeroMultisig: '0x9F403140Bc0574D7d36eA472b82DAa1Bbd4eF327', // FIXME: Not sure
  },
})

const lineaDiscoveryConfig = new DiscoveryConfig(lineaRawConfig)
