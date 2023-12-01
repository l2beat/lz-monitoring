import { assert } from '@l2beat/backend-tools'
import type {
  ContractParameters,
  DiscoveryOutput,
} from '@l2beat/discovery-types'
import {
  Bytes,
  bytes32ToAddress,
  ChainId,
  ChangelogSummary,
  DiscoveryApi,
  EthereumAddress,
  getChainIdFromEndpointId,
  RemoteChain,
} from '@lz/libs'

import {
  ChangelogRepository,
  ChangelogSummaryRecord,
} from '../../../peripherals/database/ChangelogRepository'
import { CurrentDiscoveryRepository } from '../../../peripherals/database/CurrentDiscoveryRepository'
import {
  getAddressFromValue,
  getContractByName,
  getContractValue,
} from './utils'

export class DiscoveryController {
  constructor(
    private readonly currentDiscoveryRepository: CurrentDiscoveryRepository,
    private readonly changelogRepository: ChangelogRepository,
  ) {}

  async getDiscovery(chainId: ChainId): Promise<DiscoveryApi | undefined> {
    const discovery = await this.currentDiscoveryRepository.find(chainId)
    const changelogSummary =
      await this.changelogRepository.getChangesSummary(chainId)

    if (!discovery) {
      return
    }

    return toDiscoveryApi(discovery.discoveryOutput, changelogSummary)
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

function toDiscoveryApi(
  discoveryOutput: DiscoveryOutput,
  changelogSummary: ChangelogSummaryRecord[],
): DiscoveryApi {
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
      endpoint: getEndpointContract(discoveryOutput, changelogSummary),
      ulnV2: getUlnV2Contract(discoveryOutput, changelogSummary),
      lzMultisig: getLzMultisig(discoveryOutput, changelogSummary),
    },
    addressInfo,
  }
}

function getEndpointContract(
  discoveryOutput: DiscoveryOutput,
  changelogSummary: ChangelogSummaryRecord[],
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
    changelogSummary: getChangelogSummaryApi(
      changelogSummary,
      endpoint.address,
    ),
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
  changelogSummary: ChangelogSummaryRecord[],
): DiscoveryApi['contracts']['ulnV2'] {
  const ulnV2 = getContractByName('UltraLightNodeV2', discoveryOutput)

  return {
    name: 'UltraLightNodeV2',
    changelogSummary: getChangelogSummaryApi(changelogSummary, ulnV2.address),
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
        relayer: EthereumAddress(appConfig.relayer.toString()),
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
  changelogSummary: ChangelogSummaryRecord[],
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
      changelogSummary: getChangelogSummaryApi(
        changelogSummary,
        lzMultisig.address,
      ),
      address: lzMultisig.address,
      owners,
      threshold: getContractValue(lzMultisig, 'getThreshold'),
    }
  } catch (e) {
    return null
  }
}

function getChangelogSummaryApi(
  changelogSummaries: ChangelogSummaryRecord[],
  address: EthereumAddress,
): ChangelogSummary {
  const changelogSummary = changelogSummaries.find((c) => c.address === address)

  assert(changelogSummary, 'Changelog summary not found')
  return {
    count: changelogSummary.count,
    lastChangeTimestamp: changelogSummary.lastChangeTimestamp,
  }
}
