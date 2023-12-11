import { RateLimitedProvider } from '@l2beat/discovery'
import {
  ChainId,
  CommonDiscoveryStatus,
  DiscoveryDisabledStatus,
  DiscoveryEnabledStatus,
  DiscoveryStatus,
} from '@lz/libs'
import { providers } from 'ethers'

import { BlockNumberRepository } from '../../peripherals/database/BlockNumberRepository'
import { CurrentDiscoveryRepository } from '../../peripherals/database/CurrentDiscoveryRepository'
import { IndexerStateRepository } from '../../peripherals/database/IndexerStateRepository'

export type ChainModuleStatus =
  | {
      state: 'enabled'
      visible: boolean
      chainId: ChainId
      provider: RateLimitedProvider
    }
  | {
      state: 'disabled'
      visible: boolean
      chainId: ChainId
    }

export class StatusController {
  constructor(
    private readonly chainModuleStatuses: ChainModuleStatus[],
    private readonly blockRepo: BlockNumberRepository,
    private readonly currDiscoveryRepo: CurrentDiscoveryRepository,
    private readonly indexerRepository: IndexerStateRepository,
  ) {}

  async getStatus(): Promise<DiscoveryStatus[]> {
    const discoveryStatuses = await Promise.all(
      this.chainModuleStatuses.map(async (chainModuleStatus) => {
        const { chainId, visible } = chainModuleStatus

        const commonChainData = await this.getCommonStatus(chainId, visible)

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
            node: {
              blockNumber: latestNodeBlock.number,
              blockTimestamp: latestNodeBlock.timestamp,
            },
          }

          return disabledStatus
        }

        const enabledStatus: DiscoveryEnabledStatus = {
          state: chainModuleStatus.state,
          ...commonChainData,
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
    chainVisibility: boolean,
  ): Promise<CommonDiscoveryStatus> {
    const allIndexerStates = await this.indexerRepository.getAll()

    const discovery = await this.currDiscoveryRepo.find(chainId)
    const indexerStates = allIndexerStates.filter(
      (state) => state.chainId === chainId,
    )
    const lastIndexedBlock = (await this.blockRepo.findLast(chainId)) ?? null

    const lastDiscoveredBlock = discovery?.discoveryOutput.blockNumber ?? null
    const lastDiscoveredBlockRecord = lastDiscoveredBlock
      ? await this.blockRepo.findByNumber(lastDiscoveredBlock, chainId)
      : null

    return {
      chainName: ChainId.getName(chainId),
      chainId: chainId,
      visible: chainVisibility,
      lastIndexedBlock,
      lastDiscoveredBlock: lastDiscoveredBlockRecord
        ? {
            timestamp: lastDiscoveredBlockRecord.timestamp,
            blockNumber: lastDiscoveredBlockRecord.blockNumber,
          }
        : null,
      indexerStates,
    }
  }

  private async getLatestNodeBlock(
    provider: RateLimitedProvider,
  ): Promise<providers.Block | null> {
    try {
      return await provider.getBlock('latest')
    } catch {
      return null
    }
  }
}
