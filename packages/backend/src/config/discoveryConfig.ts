import { assert } from '@l2beat/backend-tools'
// eslint-disable-next-line import/no-internal-modules
import { RawDiscoveryConfig } from '@l2beat/discovery/dist/discovery/config/RawDiscoveryConfig'
import { ChainId, EthereumAddress } from '@lz/libs'
import { utils } from 'ethers'

import { LZ_CONTRACTS_NAMES } from './constants'
import { LayerZeroAddresses } from './types'

export { createConfigFromTemplate, toEthereumAddresses }

interface TemplateVariables {
  chain: ChainId
  addresses: LayerZeroAddresses
}

function createConfigFromTemplate(
  templateConfig: TemplateVariables,
): RawDiscoveryConfig {
  const { chain, addresses: unsafeAddresses } = templateConfig

  const addresses = toSafeAddresses(unsafeAddresses)

  const names = getDiscoveryNames(addresses)

  const { stargateBridge: _, stargateToken: __, ...initials } = addresses

  const initialAddresses = toEthereumAddresses(Object.values(initials))

  return {
    name: 'layerzero',
    chain,
    initialAddresses,
    names,
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

      /// V2

      SendUln301: {
        fields: {
          defaultExecutorConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultExecutorConfigsSet',
            returnParams: ['params'],
          },
          defaultUlnConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultUlnConfigsSet',
            returnParams: ['params'],
          },
        },
      },
      ReceiveUln301: {
        fields: {
          defaultUlnConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultUlnConfigsSet',
            returnParams: ['params'],
          },
          defaultExecutors: {
            ignoreRelative: true,
            type: 'stateFromEvent',
            event: 'DefaultExecutorsSet',
            returnParams: ['params'],
          },
        },
      },
      SendUln302: {
        fields: {
          defaultExecutorConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultExecutorConfigsSet',
            returnParams: ['params'],
          },
          defaultUlnConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultUlnConfigsSet',
            returnParams: ['params'],
          },
        },
      },
      ReceiveUln302: {
        fields: {
          defaultUlnConfigs: {
            ignoreRelative: true,
            onlyValue: true,
            type: 'stateFromEvent',
            event: 'DefaultUlnConfigsSet',
            returnParams: ['params'],
          },
        },
      },
      EndpointV2: {
        ignoreMethods: [
          'EMPTY_PAYLOAD_HASH',
          'NIL_PAYLOAD_HASH',
          'getSendContext',
          'isSendingMessage',
        ],
        fields: {
          defaultReceiveLibraries: {
            ignoreRelative: true,
            type: 'stateFromEvent',
            event: 'DefaultReceiveLibrarySet',
            groupBy: 'eid',
            onlyValue: true,
            // skipping old lib
            returnParams: ['eid', 'newLib'],
          },
          defaultSendLibraries: {
            ignoreRelative: true,
            type: 'stateFromEvent',
            event: 'DefaultSendLibrarySet',
            groupBy: 'eid',
            onlyValue: true,
            returnParams: ['eid', 'newLib'],
          },
        },
      },
    },
  }
}

// Tuples
const ExecutorConfig = '(uint32 maxMessageSize, address executor)'
const SetDefaultExecutorParam = `(uint32 eid, ${ExecutorConfig} config)`
const UlnConfig =
  '(uint64 confirmations, uint8 requiredDVNCount, uint8 optionalDVNCount, uint8 optionalDVNThreshold, address[] requiredDVNs, address[] optionalDVNs)'

const SetUlnConfigParam = `(uint32 eid, ${UlnConfig} config)`

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
  {
    contract: 'endpointV2',
    abi: [
      'event DefaultReceiveLibrarySet(uint32 eid, address oldLib, address newLib)',
      'event DefaultSendLibrarySet(uint32 eid, address newLib)',
      'event LibraryRegistered(address newLib)',
      'event LzTokenSet(address token)',
      'event OwnershipTransferred(address previousOwner, address newOwner)',
    ],
  },
  {
    contract: 'send301',
    abi: [
      'event AddressSizeSet(uint16 eid, uint256 size)',
      `event DefaultExecutorConfigsSet(${SetDefaultExecutorParam}[] params)`,
      `event DefaultUlnConfigsSet(${SetUlnConfigParam}[] params)`,
      'event LzTokenSet(address token)',
      'event OwnershipTransferred(address previousOwner, address newOwner)',
      'event TreasurySet(address treasury)',
    ],
  },
  {
    contract: 'send302',
    abi: [
      `event DefaultExecutorConfigsSet(${SetDefaultExecutorParam}[])`,
      `event DefaultUlnConfigsSet(${SetUlnConfigParam}[])`,
      'event LzTokenSet(address token)',
      'event OwnershipTransferred(address previousOwner, address newOwner)',
      'event TreasurySet(address treasury)',
    ],
  },
  {
    contract: 'receive301',
    abi: [
      'event AddressSizeSet(uint16, uint256)',
      `event DefaultUlnConfigsSet(${SetUlnConfigParam}[] params)`,
      `event DefaultExecutorsSet(${SetDefaultExecutorParam}[] params)`,
      'event LzTokenSet(address token)',
      'event OwnershipTransferred(address previousOwner, address newOwner)',
      'event TreasurySet(address treasury)',
    ],
  },
  {
    contract: 'receive302',
    abi: [
      `event DefaultUlnConfigsSet(${SetUlnConfigParam}[])`,
      'event OwnershipTransferred(address,address)',
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
  return abis.flatMap(({ contract, abi }) => {
    const int = new utils.Interface(abi)
    const topics = int.fragments.map((fragment) => {
      assert(fragment.type === 'event', 'Fragment is not an event')
      const encoded = int.getEventTopic(fragment as utils.EventFragment)
      return encoded
    })

    const address = addresses[contract]

    return address
      ? {
          address: EthereumAddress(address),
          topics: [topics],
        }
      : []
  })
}

function toEthereumAddresses(addresses: string[]): EthereumAddress[] {
  return addresses.map((address) => EthereumAddress(address))
}

function toSafeAddresses(
  unsafeAddresses: LayerZeroAddresses,
): LayerZeroAddresses {
  const mapped = Object.entries(unsafeAddresses).map(([key, value]) => {
    return [key, EthereumAddress(value).toString()] as const
  })

  return Object.fromEntries(mapped) as LayerZeroAddresses
}

function getDiscoveryNames(
  addresses: LayerZeroAddresses,
): Record<string, string> {
  const { V1, V2, STARGATE } = LZ_CONTRACTS_NAMES

  // Since some on-chain LZs does not support multisig
  const multisigNameEntry = addresses.layerZeroMultisig
    ? {
        [addresses.layerZeroMultisig]: V1.MULTISIG,
      }
    : {}

  const stargateBridgeNameEntry = addresses.stargateBridge
    ? {
        [addresses.stargateBridge]: STARGATE.BRIDGE,
      }
    : {}

  const stargateTokenNameEntry = addresses.stargateToken
    ? {
        [addresses.stargateToken]: STARGATE.TOKEN,
      }
    : {}

  const names = {
    // V1
    [addresses.ultraLightNodeV2]: V1.ULTRA_LIGHT_NODE_V2,
    [addresses.endpoint]: V1.ENDPOINT,
    ...multisigNameEntry,

    // V2
    [addresses.endpointV2]: V2.ENDPOINT_V2,
    [addresses.send301]: V2.SEND301,
    [addresses.receive301]: V2.RECEIVE301,
    [addresses.send302]: V2.SEND302,
    [addresses.receive302]: V2.RECEIVE302,

    // Additional
    ...stargateBridgeNameEntry,
    ...stargateTokenNameEntry,
  }
  return names
}
