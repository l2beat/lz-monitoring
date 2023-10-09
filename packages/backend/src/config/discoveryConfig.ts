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
    layerZeroMultisig?: string
  }
}

function createConfigFromTemplate(
  templateConfig: TemplateVariables,
): RawDiscoveryConfig {
  const { chain, initialAddresses, addresses: unsafeAddresses } = templateConfig

  // addresses with proper checksums
  const addresses = {
    ultraLightNodeV2: EthereumAddress(
      unsafeAddresses.ultraLightNodeV2,
    ).toString(),
    endpoint: EthereumAddress(unsafeAddresses.endpoint).toString(),
    layerZeroMultisig:
      unsafeAddresses.layerZeroMultisig !== undefined
        ? EthereumAddress(unsafeAddresses.layerZeroMultisig).toString()
        : undefined,
  }

  // Since some on-chain LZs does not support multisig
  const multisigNameEntry = addresses.layerZeroMultisig
    ? {
        [addresses.layerZeroMultisig]: 'LayerZero Multisig',
      }
    : {}

  return {
    name: 'layerzero',
    chain,
    initialAddresses: initialAddresses.map(EthereumAddress),
    names: {
      [addresses.ultraLightNodeV2]: 'UltraLightNodeV2',
      [addresses.endpoint]: 'Endpoint',
      ...multisigNameEntry,
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
      // Maybe we should remove that if there is no multisig support?
      'LayerZero Multisig': {
        ignoreInWatchMode: ['nonce'],
      },
      UltraLightNodeV2: {
        fields: {
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
            multipleInGroup: true,
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
        },
      },
    },
  }
}
