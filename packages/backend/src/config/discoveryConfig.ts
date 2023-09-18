import { DiscoveryConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { RawDiscoveryConfig } from '@l2beat/discovery/dist/discovery/config/RawDiscoveryConfig'
import { ChainId, EthereumAddress } from '@lz/libs'

const rawConfig: RawDiscoveryConfig = {
  name: 'layerzero',
  chain: ChainId.ETHEREUM,
  initialAddresses: [
    EthereumAddress('0x4D73AdB72bC3DD368966edD0f0b2148401A178E2'), // STG
  ],
  names: {
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2': 'UltraLightNodeV2',
    '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675': 'Endpoint',
    '0x65bb797c2B9830d891D87288F029ed8dACc19705': 'Stargate Multisig',
    '0x902F09715B6303d4173037652FA7377e5b98089E': 'LayerZero_Relayer',
    '0x5a54fe5234E811466D5366846283323c954310B2': 'LayerZero_Oracle',
    '0xCDa8e3ADD00c95E5035617F970096118Ca2F4C92': 'LayerZero Multisig',
  },
  overrides: {
    'Stargate Multisig': {
      ignoreInWatchMode: ['nonce'],
    },
    Endpoint: {
      ignoreInWatchMode: ['isReceivingPayload', 'isSendingPayload'],
      fields: {
        libraryLookup: {
          type: 'array',
          method: 'libraryLookup',
          startIndex: 1,
          length: '{{ latestVersion }}',
          // ignoring because discovered.json gets clattered with ULNv1 and ULNv2RADAR.
          ignoreRelative: true,
        },
      },
    },
    'LayerZero Multisig': {
      ignoreInWatchMode: ['nonce'],
    },
    UltraLightNodeV2: {
      fields: {
        chainAddressSizeMap: {
          type: 'stateFromEvent',
          event: 'SetChainAddressSize',
          returnParams: ['chainId', 'size'],
          groupBy: 'chainId',
          onlyValue: true,
        },
        ulnLookup: {
          type: 'stateFromEvent',
          event: 'SetRemoteUln',
          returnParams: ['chainId', 'uln'],
          groupBy: 'chainId',
          onlyValue: true,
        },
        defaultAppConfig: {
          type: 'stateFromEvent',
          event: 'SetDefaultConfigForChainId',
          returnParams: [
            'chainId',
            'inboundProofLib',
            'inboundBlockConfirm',
            'outboundProofType',
            'outboundBlockConfirm',
            'oracle',
          ],
          groupBy: 'chainId',
          onlyValue: true,
        },
        defaultAdapterParams: {
          type: 'stateFromEvent',
          event: 'SetDefaultAdapterParamsForChainId',
          returnParams: ['chainId', 'proofType', 'adapterParams'],
          groupBy: 'chainId',
          onlyValue: true,
        },
        inboundProofLibrary: {
          type: 'stateFromEvent',
          event: 'AddInboundProofLibraryForChain',
          returnParams: ['chainId', 'lib'],
          groupBy: 'chainId',
          onlyValue: true,
          multipleInGroup: true,
          ignoreRelative: true,
        },
        supportedOutboundProof: {
          type: 'stateFromEvent',
          event: 'EnableSupportedOutboundProof',
          returnParams: ['chainId', 'proofType'],
          groupBy: 'chainId',
          onlyValue: true,
          multipleInGroup: true,
        },
        INBOUND_LIBRARIES: {
          type: 'arrayFromOneEvent',
          event:
            'event AddInboundProofLibraryForChain(uint16 indexed chainId, address lib)',
          valueKey: 'lib',
          ignoreRelative: true,
        },
      },
    },
  },
}

export const discoveryConfig = new DiscoveryConfig(rawConfig)
