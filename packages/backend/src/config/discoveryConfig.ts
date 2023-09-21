import { DiscoveryConfig } from '@l2beat/discovery'
// eslint-disable-next-line import/no-internal-modules
import { RawDiscoveryConfig } from '@l2beat/discovery/dist/discovery/config/RawDiscoveryConfig'
import { ChainId, EthereumAddress } from '@lz/libs'

interface TemplateVariables {
  name: string
  chain: ChainId
  initialAddresses: string[]
  addresses: {
    ultraLightNodeV2: string
    endpoint: string
    stargateMultisig: string
    layerZeroRelayer: string
    layerZeroOracle: string
    layerZeroMultisig: string
  }
}

function createConfigFromTemplate(
  templateConfig: TemplateVariables,
): RawDiscoveryConfig {
  const { name, chain, initialAddresses, addresses } = templateConfig

  return {
    name,
    chain,
    initialAddresses: initialAddresses.map(EthereumAddress),
    names: {
      [addresses.ultraLightNodeV2]: 'UltraLightNodeV2',
      [addresses.endpoint]: 'Endpoint',
      [addresses.stargateMultisig]: 'Stargate Multisig',
      [addresses.layerZeroRelayer]: 'LayerZero_Relayer',
      [addresses.layerZeroOracle]: 'LayerZero_Oracle',
      [addresses.layerZeroMultisig]: 'LayerZero Multisig',
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
}

const ethereumRawConfig = createConfigFromTemplate({
  name: 'layerzero',
  chain: ChainId.ETHEREUM,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // STG
  ],
  addresses: {
    ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
    endpoint: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    stargateMultisig: '0x65bb797c2B9830d891D87288F029ed8dACc19705',
    layerZeroRelayer: '0x902F09715B6303d4173037652FA7377e5b98089E',
    layerZeroOracle: '0x5a54fe5234E811466D5366846283323c954310B2',
    layerZeroMultisig: '0xCDa8e3ADD00c95E5035617F970096118Ca2F4C92',
  },
})

const arbitrumRawConfig = createConfigFromTemplate({
  name: 'layerzero',
  chain: ChainId.ARBITRUM,
  initialAddresses: [
    '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2', // STG
  ],
  addresses: {
    ultraLightNodeV2: '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2',
    endpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',
    stargateMultisig: '0x65bb797c2B9830d891D87288F029ed8dACc19705', // FIXME: not sure
    layerZeroRelayer: '0x177d36dbe2271a4ddb2ad8304d82628eb921d790', // FIXME: not sure
    layerZeroOracle: '0x5a54fe5234E811466D5366846283323c954310B2', // FIXME: not sure
    layerZeroMultisig: '0xFE22f5D2755b06b9149656C5793Cb15A08d09847',
  },
})

export const ethereumDiscoveryConfig = new DiscoveryConfig(ethereumRawConfig)
export const arbitrumDiscoveryConfig = new DiscoveryConfig(arbitrumRawConfig)
