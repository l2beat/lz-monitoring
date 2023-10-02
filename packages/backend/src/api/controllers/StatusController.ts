import {
  ChainId,
  CommonDiscoveryStatus,
  DiscoveryDisabledStatus,
  DiscoveryEnabledStatus,
  DiscoveryStatus,
} from '@lz/libs'
import { providers } from 'ethers'

import { BlockNumberRepository } from '../../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../../peripherals/database/IndexerStateRepository'

export type ChainModuleStatus =
  | {
      state: 'enabled'
      chainId: ChainId
      provider: providers.Provider
    }
  | {
      state: 'disabled'
      chainId: ChainId
    }

export class StatusController {
  constructor(
    private readonly chainModuleStatuses: ChainModuleStatus[],
    private readonly blockRepo: BlockNumberRepository,
    private readonly discoveryRepo: DiscoveryRepository,
    private readonly indexerRepository: IndexerStateRepository,
  ) {}

  async getStatus(): Promise<DiscoveryStatus[]> {
    const discoveryStatuses = await Promise.all(
      this.chainModuleStatuses.map(async (chainModuleStatus) => {
        const { chainId } = chainModuleStatus

        const commonChainData = await this.getCommonStatus(chainId)

        // If enabled, get metrics against the node
        if (chainModuleStatus.state === 'disabled') {
          const disabledStatus: DiscoveryDisabledStatus = {
            state: chainModuleStatus.state,
            ...commonChainData,
          }

          return disabledStatus
        }

        const latestNodeBlock = await this.getLatestNodeBlock(
          chainModuleStatus.provider,
        )

        // Discovery enabled but node did not respond
        if (!latestNodeBlock) {
          const disabledStatus: DiscoveryEnabledStatus = {
            state: chainModuleStatus.state,
            ...commonChainData,
            delays: null,
            node: null,
          }

          return disabledStatus
        }

        const { lastDiscoveredBlock, lastIndexedBlock } = commonChainData

        // Node's fine but haven't discovered any blocks yet
        if (!lastDiscoveredBlock || !lastIndexedBlock) {
          const disabledStatus: DiscoveryEnabledStatus = {
            state: chainModuleStatus.state,
            ...commonChainData,
            delays: null,
            node: {
              blockNumber: latestNodeBlock.number,
              blockTimestamp: latestNodeBlock.timestamp,
            },
          }

          return disabledStatus
        }

        const delaysAgainstNode = this.getDelays(
          latestNodeBlock.number,
          lastDiscoveredBlock,
          lastIndexedBlock.blockNumber,
        )

        const enabledStatus: DiscoveryEnabledStatus = {
          state: chainModuleStatus.state,
          ...commonChainData,
          delays: delaysAgainstNode,
          node: {
            blockNumber: latestNodeBlock.number,
            blockTimestamp: latestNodeBlock.timestamp,
          },
        }

        return enabledStatus
      }),
    )

    return discoveryStatuses
  }

  private async getCommonStatus(
    chainId: ChainId,
  ): Promise<CommonDiscoveryStatus> {
    const allIndexerStates = await this.indexerRepository.getAll()

    const discovery = await this.discoveryRepo.find(chainId)
    const indexerStates = allIndexerStates.filter(
      (state) => state.chainId === chainId,
    )
    const lastIndexedBlock = (await this.blockRepo.findLast(chainId)) ?? null

    const lastDiscoveredBlock = discovery?.discoveryOutput.blockNumber ?? null

    return {
      chainName: ChainId.getName(chainId),
      chainId: chainId,
      lastIndexedBlock,
      lastDiscoveredBlock,
      indexerStates,
    }
  }

  private async getLatestNodeBlock(
    provider: providers.Provider,
  ): Promise<providers.Block | null> {
    try {
      return await provider.getBlock('latest')
    } catch {
      return null
    }
  }

  private getDelays(
    lastNodeBlock: number,
    lastDiscoveredBlock: number,
    lastIndexedBlock: number,
  ): NonNullable<DiscoveryEnabledStatus['delays']> {
    return {
      discovery: lastNodeBlock - lastDiscoveredBlock,
      blocks: lastNodeBlock - lastIndexedBlock,
      offset: lastIndexedBlock - lastDiscoveredBlock,
    }
  }
}
