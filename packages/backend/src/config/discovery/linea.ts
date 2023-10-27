import { DiscoveryConfig } from '@l2beat/discovery'
import { ChainId } from '@lz/libs'

import { createConfigFromTemplate, getEventsToWatch } from '../discoveryConfig'

export { lineaDiscoveryConfig, lineaEventsToWatch }

const addresses = {
  ultraLightNodeV2: '0x38de71124f7a447a01d67945a51edce9ff491251',
  endpoint: '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7',
  // No multisig support
}

const lineaRawConfig = createConfigFromTemplate({
  chain: ChainId.LINEA,
  initialAddresses: [
    '0x38de71124f7a447a01d67945a51edce9ff491251', // UltraLightNodeV2
  ],
  addresses,
})

const lineaDiscoveryConfig = new DiscoveryConfig(lineaRawConfig)
const lineaEventsToWatch = getEventsToWatch(addresses)
