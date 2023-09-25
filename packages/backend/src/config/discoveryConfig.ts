// eslint-disable-next-line import/no-internal-modules
import { RawDiscoveryConfig } from '@l2beat/discovery/dist/discovery/config/RawDiscoveryConfig'
import { ChainId, EthereumAddress } from '@lz/libs'

export { createConfigFromTemplate }

interface TemplateVariables {
  chain: ChainId
  initialAddresses: string[]
  addresses: {
    ultraLightNodeV2: string
    endpoint: string
    layerZeroMultisig: string
  }
}

function createConfigFromTemplate(
  templateConfig: TemplateVariables,
): RawDiscoveryConfig {
  const { chain, initialAddresses, addresses } = templateConfig

  return {
    name: 'layerzero',
    chain,
    initialAddresses: initialAddresses.map(EthereumAddress),
    names: {
      [addresses.ultraLightNodeV2]: 'UltraLightNodeV2',
      [addresses.endpoint]: 'Endpoint',
      [addresses.layerZeroMultisig]: 'LayerZero Multisig',
    },
    overrides: {
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
}
