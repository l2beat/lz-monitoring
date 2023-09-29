import { ChainId, CommonDiscoveryStatus, DiscoveryStatus } from '@lz/libs'
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
        const onChainData =
          chainModuleStatus.state === 'enabled'
            ? await getOnChainMetrics(
                chainModuleStatus.provider,
                commonChainData.lastDiscoveredBlock ?? undefined,
                commonChainData.lastIndexedBlock?.blockNumber,
              )
            : {}

        return {
          state: chainModuleStatus.state,
          ...commonChainData,
          ...onChainData,
          // 'state' discriminator is type-naughty
        } as DiscoveryStatus
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
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getOnChainMetrics(
  provider: providers.Provider,
  lastDiscoveredBlock?: number,
  lastIndexedBlock?: number,
) {
  try {
    const latestNodeBlock = await provider.getBlock('latest')
    const latestNodeBlockNumber = latestNodeBlock.number
    const latestNodeBlockTimestamp = latestNodeBlock.timestamp

    const discoveryDelay = lastDiscoveredBlock
      ? latestNodeBlock.number - lastDiscoveredBlock
      : null

    const blockDelay = lastIndexedBlock
      ? latestNodeBlock.number - lastIndexedBlock
      : null

    const indexingOffset =
      discoveryDelay && blockDelay ? discoveryDelay - blockDelay : null

    return {
      node: {
        blockNumber: latestNodeBlockNumber,
        blockTimestamp: latestNodeBlockTimestamp,
      },
      delays: {
        discovery: discoveryDelay,
        blocks: blockDelay,
        offset: indexingOffset,
      },
    }
  } catch (e) {
    return null
  }
}
