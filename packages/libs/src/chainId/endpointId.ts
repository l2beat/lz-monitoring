// source: https://layerzero.gitbook.io/docs/technical-reference/mainnet/supported-chain-ids

import { ChainId } from './ChainId'

export { EndpointID }

const V1_ENDPOINTS = [
  { endpointId: 101, chainId: ChainId.ETHEREUM },
  { endpointId: 102, chainId: ChainId.BSC },
  { endpointId: 106, chainId: ChainId.AVALANCHE },
  { endpointId: 109, chainId: ChainId.POLYGON_POS },
  { endpointId: 110, chainId: ChainId.ARBITRUM },
  { endpointId: 111, chainId: ChainId.OPTIMISM },
  { endpointId: 125, chainId: ChainId.CELO },
  { endpointId: 158, chainId: ChainId.POLYGON_ZKEVM },
  { endpointId: 183, chainId: ChainId.LINEA },
  { endpointId: 184, chainId: ChainId.BASE },
]

const V2_ENDPOINTS = [
  { endpointId: 30101, chainId: ChainId.ETHEREUM },
  { endpointId: 30102, chainId: ChainId.BSC },
  { endpointId: 30106, chainId: ChainId.AVALANCHE },
  { endpointId: 30109, chainId: ChainId.POLYGON_POS },
  { endpointId: 30110, chainId: ChainId.ARBITRUM },
  { endpointId: 30111, chainId: ChainId.OPTIMISM },
  { endpointId: 30125, chainId: ChainId.CELO },
  { endpointId: 30158, chainId: ChainId.POLYGON_ZKEVM },
  { endpointId: 30183, chainId: ChainId.LINEA },
  { endpointId: 30184, chainId: ChainId.BASE },
]

const EndpointID = {
  decodeV1: (endpointId: string | number) =>
    V1_ENDPOINTS.find((e) => e.endpointId === +endpointId)?.chainId,
  encodeV1: (chainId: ChainId) =>
    V1_ENDPOINTS.find((e) => e.chainId === chainId)?.endpointId,
  decodeV2: (endpointId: string | number) =>
    V2_ENDPOINTS.find((e) => e.endpointId === +endpointId)?.chainId,
  encodeV2: (chainId: ChainId) =>
    V2_ENDPOINTS.find((e) => e.chainId === chainId)?.endpointId,
}
