import { assert } from '@l2beat/backend-tools'
import type {
  ContractParameters,
  DiscoveryOutput,
} from '@l2beat/discovery-types'
import {
  Bytes,
  bytes32ToAddress,
  ChainId,
  DiscoveryApi,
  EthereumAddress,
  getChainIdFromEndpointId,
  RemoteChain,
} from '@lz/libs'

import { CurrentDiscoveryRepository } from '../../../peripherals/database/CurrentDiscoveryRepository'
import {
  getAddressFromValue,
  getContractByName,
  getContractValue,
} from './utils'

export class DiscoveryController {
  constructor(
    private readonly currentDiscoveryRepository: CurrentDiscoveryRepository,
  ) {}

  async getDiscovery(chainId: ChainId): Promise<DiscoveryApi | undefined> {
    const discovery = await this.currentDiscoveryRepository.find(chainId)

    if (!discovery) {
      return
    }

    return toDiscoveryApi(discovery.discoveryOutput)
  }

  async getRawDiscovery(
    chainId: ChainId,
  ): Promise<DiscoveryOutput | undefined> {
    const discovery = await this.currentDiscoveryRepository.find(chainId)

    if (!discovery) {
      return
    }

    return discovery.discoveryOutput
  }
}

function toDiscoveryApi(discoveryOutput: DiscoveryOutput): DiscoveryApi {
  const { contracts, blockNumber, eoas } = discoveryOutput

  const endpoint = contracts.find((c) => c.name === 'Endpoint')
  assert(endpoint, 'Endpoint not found')

  const addressInfo: DiscoveryApi['addressInfo'] = contracts
    .map((contract) => ({
      address: contract.address,
      name: contract.name,
      verified: !contract.unverified,
    }))
    .concat(eoas.map((eoa) => ({ address: eoa, name: 'EOA', verified: true })))

  return {
    blockNumber,
    contracts: {
      // V1
      endpoint: getEndpointContract(discoveryOutput),
      ulnV2: getUlnV2Contract(discoveryOutput),
      lzMultisig: getLzMultisig(discoveryOutput),
      // V2
      endpointV2: getEndpointV2Contract(discoveryOutput),
      sendUln302: getSendUln302(discoveryOutput),
      receiveUln302: getReceiveUln302(discoveryOutput),
      sendUln301: getSendUln301(discoveryOutput),
      receiveUln301: getReceiveUln301(discoveryOutput),
    },
    addressInfo,
  }
}

function getEndpointContract(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['endpoint'] {
  const endpoint = getContractByName('Endpoint', discoveryOutput)

  const libraryLookupRaw = getContractValue(endpoint, 'libraryLookup')
  assert(Array.isArray(libraryLookupRaw), 'Library lookup is not an array')
  const libraryLookup = libraryLookupRaw.map((address) => {
    assert(typeof address === 'string', 'Library address is not a string')
    return EthereumAddress(address)
  })

  return {
    name: 'Endpoint',
    address: endpoint.address,
    owner: getAddressFromValue(endpoint, 'owner'),
    defaultSendLibrary: getAddressFromValue(endpoint, 'defaultSendLibrary'),
    defaultReceiveLibrary: getAddressFromValue(
      endpoint,
      'defaultReceiveLibraryAddress',
    ),
    libraryLookup,
  }
}

function getEndpointV2Contract(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['endpointV2'] {
  const endpointV2 = getContractByName('EndpointV2', discoveryOutput)

  const blockedLibrary = getAddressFromValue(endpointV2, 'blockedLibrary')
  const defaultReceiveLibraries = getContractValue<Record<string, string>>(
    endpointV2,
    'defaultReceiveLibraries',
  )
  const defaultSendLibraries = getContractValue<Record<string, string>>(
    endpointV2,
    'defaultSendLibraries',
  )
  const eid = getContractValue<number>(endpointV2, 'eid')

  const registeredLibraries = getContractValue<string[]>(
    endpointV2,
    'getRegisteredLibraries',
  )

  const lzToken = getAddressFromValue(endpointV2, 'lzToken')

  const nativeToken = getAddressFromValue(endpointV2, 'nativeToken')

  const owner = getAddressFromValue(endpointV2, 'owner')

  return {
    name: 'EndpointV2',
    address: endpointV2.address,
    blockedLibrary,
    defaultReceiveLibraries,
    defaultSendLibraries,
    lzToken,
    nativeToken,
    eid,
    registeredLibraries: registeredLibraries.map(EthereumAddress),
    owner,
  }
}

interface DefaultExecutorConfig {
  params: [[number, [number, string]]]
}

interface UlnConfig {
  params: [[number, [number, number, number, number, string[], string[]]]]
}

function getSendUln302(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['sendUln302'] {
  const sendUln302 = getContractByName('SendUln302', discoveryOutput)

  const dec = getContractValue(
    sendUln302,
    'defaultExecutorConfigs',
  ) as unknown as DefaultExecutorConfig[]

  const duc = getContractValue(
    sendUln302,
    'defaultUlnConfigs',
  ) as unknown as UlnConfig[]

  return {
    name: 'SendUln302',
    defaultExecutorConfigs: dec,
    defaultUlnConfigs: duc,
    address: sendUln302.address,

    messageLibType: getContractValue<number>(sendUln302, 'messageLibType'),
    owner: getAddressFromValue(sendUln302, 'owner'),
    treasury: getAddressFromValue(sendUln302, 'treasury'),
    version: getContractValue<[number, number, number]>(sendUln302, 'version'),
  }
}

function getSendUln301(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['sendUln301'] {
  const sendUln302 = getContractByName('SendUln301', discoveryOutput)

  const dec = getContractValue(
    sendUln302,
    'defaultExecutorConfigs',
  ) as unknown as DefaultExecutorConfig[]

  const duc = getContractValue(
    sendUln302,
    'defaultUlnConfigs',
  ) as unknown as UlnConfig[]

  return {
    name: 'SendUln301',
    defaultExecutorConfigs: dec,
    defaultUlnConfigs: duc,
    address: sendUln302.address,

    owner: getAddressFromValue(sendUln302, 'owner'),
    treasury: getAddressFromValue(sendUln302, 'treasury'),
    version: getContractValue<[number, number, number]>(sendUln302, 'version'),
  }
}

function getReceiveUln302(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['receiveUln302'] {
  const sendUln302 = getContractByName('ReceiveUln302', discoveryOutput)

  const duc = getContractValue(
    sendUln302,
    'defaultUlnConfigs',
  ) as unknown as UlnConfig[]

  return {
    name: 'ReceiveUln302',
    defaultUlnConfigs: duc,
    address: sendUln302.address,
    messageLibType: getContractValue<number>(sendUln302, 'messageLibType'),
    owner: getAddressFromValue(sendUln302, 'owner'),
    version: getContractValue<[number, number, number]>(sendUln302, 'version'),
  }
}

function getReceiveUln301(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['receiveUln301'] {
  const sendUln302 = getContractByName('ReceiveUln301', discoveryOutput)

  interface DefaultExecutor {
    params: [[number, string]]
  }

  const de = getContractValue(
    sendUln302,
    'defaultExecutors',
  ) as unknown as DefaultExecutor[]

  const duc = getContractValue(
    sendUln302,
    'defaultUlnConfigs',
  ) as unknown as UlnConfig[]

  return {
    name: 'ReceiveUln301',
    defaultUlnConfigs: duc,
    defaultExecutors: de,
    address: sendUln302.address,
    owner: getAddressFromValue(sendUln302, 'owner'),
    version: getContractValue<[number, number, number]>(sendUln302, 'version'),
  }
}

function getUlnV2Contract(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['ulnV2'] {
  const ulnV2 = getContractByName('UltraLightNodeV2', discoveryOutput)

  return {
    name: 'UltraLightNodeV2',
    address: ulnV2.address,
    owner: getAddressFromValue(ulnV2, 'owner'),
    treasuryContract: getAddressFromValue(ulnV2, 'treasuryContract'),
    layerZeroToken: getAddressFromValue(ulnV2, 'layerZeroToken'),
    remoteChains: getRemoteChains(ulnV2),
  }
}

function getRemoteChains(ulnV2: ContractParameters): RemoteChain[] {
  const remoteChainsMap: RemoteChain[] = []

  const defaultAdapterParams = getContractValue<
    Partial<Record<number, { proofType: number; adapterParams: string }[]>>
  >(ulnV2, 'defaultAdapterParams')

  const defaultAppConfig = getContractValue<
    Record<number, Partial<Record<string, number | string>>>
  >(ulnV2, 'defaultAppConfig')

  const inboundProofLibraries = getContractValue<
    Partial<Record<number, string | string[]>>
  >(ulnV2, 'inboundProofLibrary')

  const supportedOutboundProofs = getContractValue<
    Partial<Record<number, string | string[]>>
  >(ulnV2, 'supportedOutboundProof')

  const ulnLookup = getContractValue<Partial<Record<string, string>>>(
    ulnV2,
    'ulnLookup',
  )

  for (const [lzChainId] of Object.entries(defaultAdapterParams)) {
    const lzChainIdNumber = Number(lzChainId)
    const chainId = getChainIdFromEndpointId(lzChainIdNumber)
    if (!chainId) continue
    let adapterParams = defaultAdapterParams[lzChainIdNumber]
    assert(
      adapterParams !== undefined,
      'Adapter params not found for chain ' + lzChainId,
    )

    // Some chains have multiple proof types
    // But some have just one
    // So we need to normalize it to an array
    if (!Array.isArray(adapterParams)) {
      adapterParams = [adapterParams]
    }

    const appConfig = defaultAppConfig[lzChainIdNumber]
    assert(appConfig, 'App config not found for chain ' + lzChainId)
    assert(
      appConfig.inboundProofLib !== undefined,
      'Inbound proof lib not found for chain ' + lzChainId,
    )
    assert(
      appConfig.inboundBlockConfirm !== undefined,
      'Inbound proof confirm not found for chain ' + lzChainId,
    )
    assert(
      appConfig.outboundProofType !== undefined,
      'Outbound proof type not found for chain ' + lzChainId,
    )
    assert(
      appConfig.outboundBlockConfirm !== undefined,
      'Outbound block confirm not found for chain ' + lzChainId,
    )
    assert(appConfig.oracle, 'Oracle not found for chain ' + lzChainId)
    assert(appConfig.relayer, 'Relayer not found for chain ' + lzChainId)

    const inboundProofLibraryValue = inboundProofLibraries[lzChainIdNumber]
    assert(
      inboundProofLibraryValue !== undefined,
      'Inbound proof library not found for chain ' + lzChainId,
    )
    const inboundProofLibraryMap = Array.isArray(inboundProofLibraryValue)
      ? inboundProofLibraryValue.map(EthereumAddress)
      : [EthereumAddress(inboundProofLibraryValue)]
    const inboundProofLibraryAddress =
      inboundProofLibraryMap[+appConfig.inboundProofLib - 1]
    assert(
      inboundProofLibraryAddress !== undefined,
      'Inbound proof library not found for chain ' + lzChainId,
    )

    const supportedOutboundProof = supportedOutboundProofs[lzChainIdNumber]
    assert(
      supportedOutboundProof !== undefined,
      'Outbound proof library not found for chain ' + lzChainId,
    )

    const uln = ulnLookup[lzChainId]
    assert(uln, 'ULN not found for chain ' + lzChainId)

    remoteChainsMap.push({
      name: ChainId.getName(chainId),
      chainId,
      lzChainId: lzChainIdNumber,
      uln: bytes32ToAddress(Bytes.fromHex(uln)),
      defaultAppConfig: {
        inboundProofLib: {
          version: +appConfig.inboundProofLib,
          address: inboundProofLibraryAddress,
        },
        inboundProofConfirm: +appConfig.inboundBlockConfirm,
        outboundProofType: +appConfig.outboundProofType,
        outboundBlockConfirm: +appConfig.outboundBlockConfirm,
        oracle: EthereumAddress(appConfig.oracle.toString()),
        relayer: EthereumAddress(appConfig.relayer.toString()),
      },
      defaultAdapterParams: adapterParams,
      supportedOutboundProof: Array.isArray(supportedOutboundProof)
        ? supportedOutboundProof.map(Number)
        : [Number(supportedOutboundProof)],
    })
  }

  return remoteChainsMap
}

function getLzMultisig(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['lzMultisig'] | null {
  try {
    const lzMultisig = getContractByName('LayerZero Multisig', discoveryOutput)

    const ownersRaw = getContractValue(lzMultisig, 'getOwners')
    assert(Array.isArray(ownersRaw), 'Owners is not an array')
    const owners = ownersRaw.map((owner) => {
      assert(typeof owner === 'string', 'Owner is not a string')
      return EthereumAddress(owner)
    })

    return {
      name: 'LayerZero Multisig',
      address: lzMultisig.address,
      owners,
      threshold: getContractValue(lzMultisig, 'getThreshold'),
    }
  } catch (e) {
    return null
  }
}
