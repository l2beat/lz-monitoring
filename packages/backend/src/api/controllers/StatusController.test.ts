import { assert } from '@l2beat/backend-tools'
import { DiscoveryOutput } from '@l2beat/discovery-types'
import { ChainId, Hash256, UnixTime } from '@lz/libs'
import { expect, mockObject } from 'earl'
import { providers } from 'ethers'

import {
  BlockNumberRecord,
  BlockNumberRepository,
} from '../../peripherals/database/BlockNumberRepository'
import {
  DiscoveryRecord,
  DiscoveryRepository,
} from '../../peripherals/database/DiscoveryRepository'
import {
  IndexerStateRecord,
  IndexerStateRepository,
} from '../../peripherals/database/IndexerStateRepository'
import { ChainModuleStatus, StatusController } from './StatusController'

describe(StatusController.name, () => {
  describe('module disabled', () => {
    describe('indexers have not run yet', () => {
      it('returns only basic information about the module', async () => {
        const chainModuleStatuses: ChainModuleStatus[] = [
          {
            state: 'disabled',
            chainId: ChainId.ETHEREUM,
          },
        ]

        const discoveryRepo = mockObject<DiscoveryRepository>({
          find: () => Promise.resolve(undefined),
        })

        const indexerStatesRepo = mockObject<IndexerStateRepository>({
          getAll: () => Promise.resolve([]),
        })

        const blockRepo = mockObject<BlockNumberRepository>({
          findLast: () => Promise.resolve(undefined),
        })

        const controller = new StatusController(
          chainModuleStatuses,
          blockRepo,
          discoveryRepo,
          indexerStatesRepo,
        )

        const [status] = await controller.getStatus()

        assert(status)
        assert(status.state === 'disabled')

        expect(status.state).toEqual('disabled')
        expect(status.chainId).toEqual(ChainId.ETHEREUM)
        expect(status.chainName).toEqual('ethereum')
        expect(status.lastIndexedBlock).toEqual(null)
        expect(status.lastDiscoveredBlock).toEqual(null)
      })
    })

    describe('indexers have been running before turning off module', () => {
      it('returns basic information extended with latest blocks-related data', async () => {
        const deps = mockDeps()
        const chainModuleStatuses: ChainModuleStatus[] = [
          {
            state: 'disabled',
            chainId: ChainId.ETHEREUM,
          },
        ]

        const controller = new StatusController(
          chainModuleStatuses,
          deps.blockRepo,
          deps.discoveryRepo,
          deps.indexerRepository,
        )

        const [status] = await controller.getStatus()

        assert(status)

        expect(status.state).toEqual('disabled')
        expect(status.chainId).toEqual(ChainId.ETHEREUM)
        expect(status.chainName).toEqual('ethereum')
        expect(status.lastIndexedBlock).toEqual({
          blockHash: deps.lastIndexedBlock.blockHash,
          blockNumber: deps.lastIndexedBlock.blockNumber,
          chainId: deps.lastIndexedBlock.chainId,
          timestamp: deps.lastIndexedBlock.timestamp,
        })
        expect(status.lastDiscoveredBlock).toEqual(
          deps.LATEST_DISCOVERY_BLOCK_NUMBER,
        )
      })
    })
  })

  describe('module enabled', () => {
    describe('indexers have not run yet', () => {
      describe('node healthy at query time', () => {
        it('returns basic information and node-related data excluding latest block-related data', async () => {
          const deps = mockDeps()
          const discoveryRepo = mockObject<DiscoveryRepository>({
            find: () => Promise.resolve(undefined),
          })

          const indexerStatesRepo = mockObject<IndexerStateRepository>({
            getAll: () => Promise.resolve([]),
          })

          const blockRepo = mockObject<BlockNumberRepository>({
            findLast: () => Promise.resolve(undefined),
          })

          const controller = new StatusController(
            deps.chainModuleStatuses,
            blockRepo,
            discoveryRepo,
            indexerStatesRepo,
          )

          const [status] = await controller.getStatus()

          assert(status)
          assert(status.state === 'enabled')

          expect(status.state).toEqual('enabled')
          expect(status.chainId).toEqual(ChainId.ETHEREUM)
          expect(status.chainName).toEqual('ethereum')
          expect(status.lastIndexedBlock).toEqual(null)
          expect(status.lastDiscoveredBlock).toEqual(null)
          expect(status.delays).toEqual(null)
          expect(status.node).toEqual({
            blockNumber: deps.LATEST_BLOCK_NUMBER,
            blockTimestamp: deps.LATEST_BLOCK_TIMESTAMP,
          })
        })
      })

      describe('node unhealthy at query time', () => {
        it('returns only basic information', async () => {
          const deps = mockDeps()

          deps.provider.getBlock.rejectsWith('ANY_ERROR_WHILE_FETCHING_BLOCK')

          const discoveryRepo = mockObject<DiscoveryRepository>({
            find: () => Promise.resolve(undefined),
          })

          const indexerStatesRepo = mockObject<IndexerStateRepository>({
            getAll: () => Promise.resolve([]),
          })

          const blockRepo = mockObject<BlockNumberRepository>({
            findLast: () => Promise.resolve(undefined),
          })

          const controller = new StatusController(
            deps.chainModuleStatuses,
            blockRepo,
            discoveryRepo,
            indexerStatesRepo,
          )

          const [status] = await controller.getStatus()

          assert(status)
          assert(status.state === 'enabled')

          expect(status.state).toEqual('enabled')
          expect(status.chainId).toEqual(ChainId.ETHEREUM)
          expect(status.chainName).toEqual('ethereum')
          expect(status.lastIndexedBlock).toEqual(null)
          expect(status.lastDiscoveredBlock).toEqual(null)
          expect(status.delays).toEqual(null)
          expect(status.node).toEqual(null)
        })
      })
    })

    describe('indexers have been running before', () => {
      describe('node healthy at query time', () => {
        it('returns complete status including delays and node information', async () => {
          const deps = mockDeps()

          const controller = new StatusController(
            deps.chainModuleStatuses,
            deps.blockRepo,
            deps.discoveryRepo,
            deps.indexerRepository,
          )

          const [status] = await controller.getStatus()

          assert(status)
          assert(status.state === 'enabled')

          expect(status.state).toEqual('enabled')
          expect(status.chainId).toEqual(ChainId.ETHEREUM)
          expect(status.chainName).toEqual('ethereum')
          expect(status.lastIndexedBlock).toEqual(deps.lastIndexedBlock)
          expect(status.lastDiscoveredBlock).toEqual(
            deps.discoveryResult.discoveryOutput.blockNumber,
          )
          expect(status.delays).toEqual({
            offset:
              deps.LATEST_INDEXED_BLOCK_NUMBER -
              deps.LATEST_DISCOVERY_BLOCK_NUMBER,
            discovery:
              deps.LATEST_BLOCK_NUMBER - deps.LATEST_DISCOVERY_BLOCK_NUMBER,
            blocks: deps.LATEST_BLOCK_NUMBER - deps.LATEST_INDEXED_BLOCK_NUMBER,
          })
          expect(status.node).toEqual({
            blockNumber: deps.LATEST_BLOCK_NUMBER,
            blockTimestamp: deps.LATEST_BLOCK_TIMESTAMP,
          })
        })
      })

      describe('node unhealthy at query time', () => {
        it('returns status excluding delays and node information', async () => {
          const deps = mockDeps()

          deps.provider.getBlock.rejectsWith('ANY_ERROR_WHILE_FETCHING_BLOCK')

          const controller = new StatusController(
            deps.chainModuleStatuses,
            deps.blockRepo,
            deps.discoveryRepo,
            deps.indexerRepository,
          )

          const [status] = await controller.getStatus()

          assert(status)
          assert(status.state === 'enabled')

          expect(status.state).toEqual('enabled')
          expect(status.chainId).toEqual(ChainId.ETHEREUM)
          expect(status.chainName).toEqual('ethereum')
          expect(status.lastIndexedBlock).toEqual(deps.lastIndexedBlock)
          expect(status.lastDiscoveredBlock).toEqual(
            deps.discoveryResult.discoveryOutput.blockNumber,
          )
          expect(status.delays).toEqual(null)
          expect(status.node).toEqual(null)
        })
      })
    })
  })
})

/**
 * Returns dependencies for most optimistic data scenario.
 */
function mockDeps() {
  const LATEST_BLOCK_NUMBER = 1010
  const LATEST_BLOCK_TIMESTAMP = 1_000_000
  const LATEST_DISCOVERY_BLOCK_NUMBER = 1000
  const LATEST_INDEXED_BLOCK_NUMBER = 1000

  const provider = mockObject<providers.Provider>({
    getBlock: () =>
      Promise.resolve({
        number: LATEST_BLOCK_NUMBER,
        timestamp: LATEST_BLOCK_TIMESTAMP,
      } as providers.Block),
  })

  const indexerStates: IndexerStateRecord[] = [
    {
      id: 'BlockNumberIndexer',
      chainId: ChainId.ETHEREUM,
      height: LATEST_INDEXED_BLOCK_NUMBER,
    },
    {
      id: 'DiscoveryIndexer',
      chainId: ChainId.ETHEREUM,
      height: LATEST_INDEXED_BLOCK_NUMBER,
    },
  ]

  const discoveryResult: DiscoveryRecord = {
    chainId: ChainId.ETHEREUM,
    discoveryOutput: {
      blockNumber: LATEST_DISCOVERY_BLOCK_NUMBER,
    } as DiscoveryOutput,
  }

  const lastIndexedBlock: BlockNumberRecord = {
    chainId: ChainId.ETHEREUM,
    blockHash: Hash256.random(),
    timestamp: UnixTime.now(),
    blockNumber: LATEST_INDEXED_BLOCK_NUMBER,
  }

  const blockRepo = mockObject<BlockNumberRepository>({
    findLast: () => Promise.resolve(lastIndexedBlock),
  })
  const discoveryRepo = mockObject<DiscoveryRepository>({
    find: () => Promise.resolve(discoveryResult),
  })
  const indexerRepository = mockObject<IndexerStateRepository>({
    getAll: () => Promise.resolve(indexerStates),
  })

  const chainModuleStatuses: ChainModuleStatus[] = [
    {
      state: 'enabled',
      chainId: ChainId.ETHEREUM,
      provider: provider,
    },
  ]

  return {
    LATEST_BLOCK_NUMBER,
    LATEST_BLOCK_TIMESTAMP,
    LATEST_DISCOVERY_BLOCK_NUMBER,
    LATEST_INDEXED_BLOCK_NUMBER,
    provider,
    indexerStates,
    discoveryResult,
    lastIndexedBlock,
    blockRepo,
    discoveryRepo,
    indexerRepository,
    chainModuleStatuses,
  }
}