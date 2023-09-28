import { ChainId, DiscoveryStatus } from '@lz/libs'
import { providers } from 'ethers'

import { BlockNumberRepository } from '../../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../../peripherals/database/IndexerStateRepository'

interface ProviderWithMetadata {
  provider: providers.Provider
  chainId: ChainId
}

export class StatusController {
  constructor(
    private readonly enabledProviders: ProviderWithMetadata[],
    private readonly blockRepo: BlockNumberRepository,
    private readonly discoveryRepo: DiscoveryRepository,
    private readonly indexerRepository: IndexerStateRepository,
  ) {}

  async getStatus(): Promise<DiscoveryStatus[]> {
    const allIndexerStates = await this.indexerRepository.getAll()

    const discoveryStatuses = await Promise.all(
      this.enabledProviders.map(async ({ provider, chainId }) => {
        const latestNodeBlock = await provider.getBlock('latest')
        const discovery = await this.discoveryRepo.find(chainId)
        const indexerStates = allIndexerStates.filter(
          (state) => state.chainId === chainId,
        )
        const lastIndexedBlock =
          (await this.blockRepo.findLast(chainId)) ?? null

        const lastDiscoveredBlock = discovery
          ? discovery.discoveryOutput.blockNumber
          : null

        const discoveryDelay = lastDiscoveredBlock
          ? latestNodeBlock.number - lastDiscoveredBlock
          : null

        const blockDelay = lastIndexedBlock
          ? latestNodeBlock.number - lastIndexedBlock.blockNumber
          : null

        const indexingOffset =
          discoveryDelay && blockDelay ? discoveryDelay - blockDelay : null

        return {
          chainName: ChainId.getName(chainId),
          chainId: chainId,
          node: {
            blockNumber: latestNodeBlock.number,
            blockTimestamp: latestNodeBlock.timestamp,
          },
          lastIndexedBlock,
          lastDiscoveredBlock,
          indexerStates,
          delay: {
            discovery: discoveryDelay,
            blocks: blockDelay,
            offset: indexingOffset,
          },
        }
      }),
    )

    return discoveryStatuses
  }
}
