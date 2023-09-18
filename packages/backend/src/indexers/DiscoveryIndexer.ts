import { assert, Logger } from '@l2beat/backend-tools'
import {
  DiscoveryConfig,
  DiscoveryEngine,
  toDiscoveryOutput,
} from '@l2beat/discovery'
import type { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChildIndexer } from '@l2beat/uif'
import { UnixTime } from '@lz/libs'

import { BlockNumberRepository } from '../peripherals/database/BlockNumberRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { BlockNumberIndexer } from './BlockNumberIndexer'

export class DiscoveryIndexer extends ChildIndexer {
  private readonly id = 'DiscoveryIndexer'
  constructor(
    private readonly discoveryEngine: DiscoveryEngine,
    private readonly config: DiscoveryConfig,
    private readonly blockNumberRepository: BlockNumberRepository,
    private readonly discoveryRepository: DiscoveryRepository,
    private readonly indexerStateRepository: IndexerStateRepository,
    logger: Logger,
    blockNumberIndexer: BlockNumberIndexer,
  ) {
    super(logger, [blockNumberIndexer])
  }

  async update(_fromTimestamp: number, toTimestamp: number): Promise<number> {
    const updatedToTimestamp = await this.runAndSaveDiscovery(
      new UnixTime(toTimestamp),
    )
    return updatedToTimestamp.toNumber()
  }

  private async runAndSaveDiscovery(timestamp: UnixTime): Promise<UnixTime> {
    const blockNumber =
      (await this.blockNumberRepository.findAtOrBefore(timestamp)) ?? 0
    this.logger.info('Running discovery', { blockNumber })

    const analysis = await this.discoveryEngine.discover(
      this.config,
      blockNumber,
    )

    const discoveryOutput = toDiscoveryOutput(
      this.config.name,
      this.config.chainId,
      this.config.hash,
      blockNumber,
      analysis,
    )

    assert(
      !hasErrors(discoveryOutput),
      'Errors in discovery output ' + errorsToString(discoveryOutput),
    )

    await this.discoveryRepository.addOrUpdate({ discoveryOutput })
    this.logger.info('Discovery finished', { blockNumber })

    return timestamp
  }

  override async invalidate(targetHeight: number): Promise<number> {
    const invalidatedToTimestamp = await this.runAndSaveDiscovery(
      new UnixTime(targetHeight),
    )
    return invalidatedToTimestamp.toNumber()
  }

  async getSafeHeight(): Promise<number> {
    const state = await this.indexerStateRepository.findById(this.id)
    return state?.height ?? 0
  }

  async setSafeHeight(height: number): Promise<void> {
    await this.indexerStateRepository.addOrUpdate({ id: this.id, height })
  }
}

function hasErrors(discoveryOutput: DiscoveryOutput): boolean {
  return discoveryOutput.contracts.some((x) => x.errors !== undefined)
}

function errorsToString(discoveryOutput: DiscoveryOutput): string {
  const errors: string[] = []
  for (const contract of discoveryOutput.contracts) {
    if (contract.errors) {
      errors.push(
        `contract: ${contract.name}(${contract.address.toString()}), errors: ` +
          JSON.stringify(contract.errors),
      )
    }
  }

  return errors.join('\n')
}
