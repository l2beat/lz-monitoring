import { Logger } from '@l2beat/backend-tools'
import { ContractParameters, DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, EthereumAddress } from '@lz/libs'
import { expect, mockObject } from 'earl'

import { ChangelogRepository } from '../peripherals/database/ChangelogRepository'
import { DiscoveryRepository } from '../peripherals/database/DiscoveryRepository'
import { IndexerStateRepository } from '../peripherals/database/IndexerStateRepository'
import { MilestoneRepository } from '../peripherals/database/MilestoneRepository'
import { ChangelogIndexer } from './ChangelogIndexer'
import { DiscoveryIndexer } from './DiscoveryIndexer'

describe(ChangelogIndexer.name, () => {
  describe(ChangelogIndexer.prototype.update.name, () => {
    describe('no discoveries to update', () => {
      it('should not do anything but return requested height', async () => {
        const discoveryRepository = mockObject<DiscoveryRepository>({
          getSortedInRange: async () => [],
        })

        const changelogIndexer = new ChangelogIndexer(
          mockObject<ChangelogRepository>(),
          mockObject<MilestoneRepository>(),
          mockObject<IndexerStateRepository>(),
          discoveryRepository,
          ChainId.ETHEREUM,
          [],
          mockObject<DiscoveryIndexer>({
            subscribe: () => {},
          }),
          Logger.SILENT,
        )

        const height = await changelogIndexer.update(0, 100)

        expect(height).toEqual(100)

        expect(discoveryRepository.getSortedInRange).toHaveBeenCalledTimes(1)
        expect(discoveryRepository.getSortedInRange).toHaveBeenCalledWith(
          0,
          100,
          ChainId.ETHEREUM,
        )
      })
    })

    describe('indexer has run in the past', () => {
      it('should throw error if past reference output could not be found', async () => {
        const chainId = ChainId.ETHEREUM
        const discoveryRepository = mockObject<DiscoveryRepository>({
          getSortedInRange: async () => [
            {
              chainId,
              discoveryOutput: {} as DiscoveryOutput,
              blockNumber: 100,
            },
            {
              chainId,
              discoveryOutput: {} as DiscoveryOutput,
              blockNumber: 200,
            },
          ],
          findAtOrBefore: async () => undefined, // No reference
        })

        const changelogIndexer = new ChangelogIndexer(
          mockObject<ChangelogRepository>(),
          mockObject<MilestoneRepository>(),
          mockObject<IndexerStateRepository>(),
          discoveryRepository,
          ChainId.ETHEREUM,
          [],
          mockObject<DiscoveryIndexer>({
            subscribe: () => {},
          }),
          Logger.SILENT,
        )

        await expect(() => changelogIndexer.update(100, 300)).toBeRejectedWith(
          'Reference discovery not found for non-genesis comparison',
        )
      })

      it('should include genesis reference while diffing from 0 block', async () => {
        const project = 'layerzero'
        const chainId = ChainId.ETHEREUM
        const chainName = ChainId.getName(chainId)

        const endpoint = {
          name: 'Endpoint',
          address: EthereumAddress.random(),
        }

        const endpointAt100Block = {
          ...endpoint,
          values: {
            testProperty: 1,
          },
        } as unknown as ContractParameters

        const endpointAt200Block = {
          ...endpoint,
          values: {
            testProperty: 2,
          },
        } as unknown as ContractParameters

        const discoveryRepository = mockObject<DiscoveryRepository>({
          getSortedInRange: async () => [
            {
              chainId: ChainId.ETHEREUM,
              discoveryOutput: {
                name: project,
                chain: chainName,
                contracts: [endpointAt100Block],
                blockNumber: 100,
              } as DiscoveryOutput,
              blockNumber: 100,
            },
            {
              chainId: ChainId.ETHEREUM,
              discoveryOutput: {
                name: project,
                chain: chainName,
                contracts: [endpointAt200Block],
                blockNumber: 200,
              } as DiscoveryOutput,
              blockNumber: 200,
            },
          ],
        })

        const changelogRepository = mockObject<ChangelogRepository>({
          addMany: async () => 0,
        })

        const milestoneRepository = mockObject<MilestoneRepository>({
          addMany: async () => 0,
        })

        const whitelist = [endpoint.address]

        const changelogIndexer = new ChangelogIndexer(
          changelogRepository,
          milestoneRepository,
          mockObject<IndexerStateRepository>(),
          discoveryRepository,
          ChainId.ETHEREUM,
          whitelist,
          mockObject<DiscoveryIndexer>({
            subscribe: () => {},
          }),
          Logger.SILENT,
        )

        await changelogIndexer.update(0, 300)

        expect(changelogRepository.addMany).toHaveBeenCalledTimes(1)
        expect(changelogRepository.addMany).toHaveBeenNthCalledWith(1, [
          {
            targetName: endpoint.name,
            targetAddress: endpoint.address,
            chainId,
            blockNumber: 100,
            modificationType: 'OBJECT_NEW_PROPERTY',
            parameterName: 'testProperty',
            parameterPath: ['testProperty'],
            previousValue: null,
            currentValue: '1',
          },
          {
            targetName: endpoint.name,
            targetAddress: endpoint.address,
            chainId,
            blockNumber: 200,
            modificationType: 'OBJECT_EDITED_PROPERTY',
            parameterName: 'testProperty',
            parameterPath: ['testProperty'],
            previousValue: '1',
            currentValue: '2',
          },
        ])

        // Genesis reference was created since we have creation milestone present
        expect(milestoneRepository.addMany).toHaveBeenCalledTimes(1)
        expect(milestoneRepository.addMany).toHaveBeenNthCalledWith(1, [
          {
            targetName: endpoint.name,
            targetAddress: endpoint.address,
            chainId,
            blockNumber: 100,
            operation: 'CONTRACT_ADDED',
          },
        ])
      })

      it('should past discovery as a reference when updating', async () => {
        const project = 'layerzero'
        const chainId = ChainId.ETHEREUM
        const chainName = ChainId.getName(chainId)

        const endpoint = {
          name: 'Endpoint',
          address: EthereumAddress.random(),
        }

        const endpointAt100Block = {
          ...endpoint,
          values: {
            testProperty: 1,
          },
        } as unknown as ContractParameters

        const endpointAt200Block = {
          ...endpoint,
          values: {
            testProperty: 2,
          },
        } as unknown as ContractParameters

        const endpointAt300Block = {
          ...endpoint,
          values: {
            testProperty: 3,
          },
        } as unknown as ContractParameters

        const discoveryRepository = mockObject<DiscoveryRepository>({
          getSortedInRange: async () => [
            {
              chainId: ChainId.ETHEREUM,
              discoveryOutput: {
                name: project,
                chain: chainName,
                contracts: [endpointAt200Block],
                blockNumber: 200,
              } as DiscoveryOutput,
              blockNumber: 200,
            },
            {
              chainId: ChainId.ETHEREUM,
              discoveryOutput: {
                name: project,
                chain: chainName,
                contracts: [endpointAt300Block],
                blockNumber: 300,
              } as DiscoveryOutput,
              blockNumber: 300,
            },
          ],
          findAtOrBefore: async () => ({
            chainId: ChainId.ETHEREUM,
            discoveryOutput: {
              name: project,
              chain: chainName,
              contracts: [endpointAt100Block],
              blockNumber: 100,
            } as DiscoveryOutput,
            blockNumber: 100,
          }),
        })

        const changelogRepository = mockObject<ChangelogRepository>({
          addMany: async () => 0,
        })

        const milestoneRepository = mockObject<MilestoneRepository>({
          addMany: async () => 0,
        })

        const whitelist = [endpoint.address]

        const changelogIndexer = new ChangelogIndexer(
          changelogRepository,
          milestoneRepository,
          mockObject<IndexerStateRepository>(),
          discoveryRepository,
          ChainId.ETHEREUM,
          whitelist,
          mockObject<DiscoveryIndexer>({
            subscribe: () => {},
          }),
          Logger.SILENT,
        )

        await changelogIndexer.update(100, 300)

        expect(changelogRepository.addMany).toHaveBeenCalledTimes(1)
        expect(changelogRepository.addMany).toHaveBeenNthCalledWith(1, [
          {
            targetName: endpoint.name,
            targetAddress: endpoint.address,
            chainId,
            blockNumber: 200,
            modificationType: 'OBJECT_EDITED_PROPERTY',
            parameterName: 'testProperty',
            parameterPath: ['testProperty'],
            previousValue: '1',
            currentValue: '2',
          },
          {
            targetName: endpoint.name,
            targetAddress: endpoint.address,
            chainId,
            blockNumber: 300,
            modificationType: 'OBJECT_EDITED_PROPERTY',
            parameterName: 'testProperty',
            parameterPath: ['testProperty'],
            previousValue: '2',
            currentValue: '3',
          },
        ])

        expect(milestoneRepository.addMany).toHaveBeenCalledTimes(1)
        expect(milestoneRepository.addMany).toHaveBeenNthCalledWith(1, [])
      })
    })
  })
})
