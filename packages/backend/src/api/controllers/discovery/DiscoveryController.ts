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
  getChainIdFromLzId,
  RemoteChain,
} from '@lz/libs'

import { DiscoveryRepository } from '../../../peripherals/database/DiscoveryRepository'
import {
  getAddressFromValue,
  getContractByName,
  getContractValue,
} from './utils'

export class DiscoveryController {
  constructor(private readonly discoveryRepository: DiscoveryRepository) {}

  async getDiscovery(chainId: ChainId): Promise<DiscoveryApi | undefined> {
    const discovery = await this.discoveryRepository.find(chainId)

    if (!discovery) {
      return
    }

    return toDiscoveryApi(discovery.discoveryOutput)
  }

  async getRawDiscovery(
    chainId: ChainId,
  ): Promise<DiscoveryOutput | undefined> {
    const discovery = await this.discoveryRepository.find(chainId)

    if (!discovery) {
      return
    }

    return discovery.discoveryOutput
  }
}

function toDiscoveryApi(discoveryOutput: DiscoveryOutput): DiscoveryApi {
  const { contracts, blockNumber } = discoveryOutput

  const endpoint = contracts.find((c) => c.name === 'Endpoint')
  assert(endpoint, 'Endpoint not found')

  return {
    blockNumber,
    contracts: {
      endpoint: getEndpointContract(discoveryOutput),
      ulnV2: getUlnV2Contract(discoveryOutput),
      lzMultisig: getLzMultisig(discoveryOutput),
    },
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
    const chainId = getChainIdFromLzId(lzChainIdNumber)
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

    const inboundProofLibrary = inboundProofLibraries[lzChainIdNumber]
    assert(
      inboundProofLibrary !== undefined,
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
        inboundProofLib: +appConfig.inboundProofLib,
        inboundProofConfirm: +appConfig.inboundBlockConfirm,
        outboundProofType: +appConfig.outboundProofType,
        outboundBlockConfirm: +appConfig.outboundBlockConfirm,
        oracle: EthereumAddress(appConfig.oracle.toString()),
      },
      defaultAdapterParams: adapterParams,
      supportedOutboundProof: Array.isArray(supportedOutboundProof)
        ? supportedOutboundProof.map(Number)
        : [Number(supportedOutboundProof)],
      inboundProofLibrary: Array.isArray(inboundProofLibrary)
        ? inboundProofLibrary.map(EthereumAddress)
        : [EthereumAddress(inboundProofLibrary)],
    })
  }

  return remoteChainsMap
}

function getLzMultisig(
  discoveryOutput: DiscoveryOutput,
): DiscoveryApi['contracts']['lzMultisig'] | undefined {
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
    return
  }
}
