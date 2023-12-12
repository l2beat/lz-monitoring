import { assert } from '@l2beat/backend-tools'
// eslint-disable-next-line import/no-internal-modules
import { RawDiscoveryConfig } from '@l2beat/discovery/dist/discovery/config/RawDiscoveryConfig'
import { ChainId, EthereumAddress } from '@lz/libs'
import { utils } from 'ethers'

export { createConfigFromTemplate, toEthereumAddresses }

interface TemplateVariables {
  chain: ChainId
  initialAddresses: string[]
  addresses: {
    ultraLightNodeV2: string
    endpoint: string
    stargateToken?: string
    stargateBridge?: string
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
    stargateToken: unsafeAddresses.stargateToken
      ? EthereumAddress(unsafeAddresses.stargateToken).toString()
      : undefined,
    stargateBridge: unsafeAddresses.stargateBridge
      ? EthereumAddress(unsafeAddresses.stargateBridge).toString()
      : undefined,
  }

  // Since some on-chain LZs does not support multisig
  const multisigNameEntry = addresses.layerZeroMultisig
    ? {
        [addresses.layerZeroMultisig]: 'LayerZero Multisig',
      }
    : {}
  const stargateBridgeNameEntry = addresses.stargateBridge
    ? {
        [addresses.stargateBridge]: 'Stargate Bridge',
      }
    : {}
  const stargateTokenNameEntry = addresses.stargateToken
    ? {
        [addresses.stargateToken]: 'Stargate Token',
      }
    : {}

  return {
    name: 'layerzero',
    chain,
    initialAddresses: initialAddresses.map(EthereumAddress),
    names: {
      [addresses.ultraLightNodeV2]: 'UltraLightNodeV2',
      [addresses.endpoint]: 'Endpoint',
      ...stargateBridgeNameEntry,
      ...stargateTokenNameEntry,
      ...multisigNameEntry,
    },
    overrides: {
      'Stargate Token': {
        ignoreDiscovery: true,
      },
      'Stargate Bridge': {
        ignoreDiscovery: true,
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
              'relayer',
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

const abis = [
  {
    contract: 'ultraLightNodeV2',
    abi: [
      'event AddInboundProofLibraryForChain(uint16 indexed chainId, address lib)',
      'event EnableSupportedOutboundProof(uint16 indexed chainId, uint16 proofType)',
      'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
      'event SetChainAddressSize(uint16 indexed chainId, uint256 size)',
      'event SetDefaultAdapterParamsForChainId(uint16 indexed chainId, uint16 indexed proofType, bytes adapterParams)',
      'event SetDefaultConfigForChainId(uint16 indexed chainId, uint16 inboundProofLib, uint64 inboundBlockConfirm, address relayer, uint16 outboundProofType, uint64 outboundBlockConfirm, address oracle)',
      'event SetLayerZeroToken(address indexed tokenAddress)',
      'event SetRemoteUln(uint16 indexed chainId, bytes32 uln)',
      'event SetTreasury(address indexed treasuryAddress)',
    ],
  },
  {
    contract: 'endpoint',
    abi: [
      'event DefaultReceiveVersionSet(uint16 version)',
      'event DefaultSendVersionSet(uint16 version)',
      'event NewLibraryVersionAdded(uint16 version)',
      'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
    ],
  },
] as const

interface EventToWatchConfig {
  address: EthereumAddress
  topics: string[][]
}

export type EventsToWatchConfig = EventToWatchConfig[]

export function getEventsToWatch(
  addresses: TemplateVariables['addresses'],
): EventsToWatchConfig {
  return abis.map(({ contract, abi }) => {
    const int = new utils.Interface(abi)
    const topics = int.fragments.map((fragment) => {
      assert(fragment.type === 'event', 'Fragment is not an event')
      const encoded = int.getEventTopic(fragment as utils.EventFragment)
      return encoded
    })

    const address = addresses[contract]

    return {
      address: EthereumAddress(address),
      topics: [topics],
    }
  })
}

function toEthereumAddresses(addresses: string[]): EthereumAddress[] {
  return addresses.map((address) => EthereumAddress(address))
}
