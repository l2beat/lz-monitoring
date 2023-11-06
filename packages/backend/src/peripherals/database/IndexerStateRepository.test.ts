import { Logger } from '@l2beat/backend-tools'
import { ChainId, Hash256 } from '@lz/libs'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { IndexerStateRepository } from './IndexerStateRepository'

describe(IndexerStateRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new IndexerStateRepository(database, Logger.SILENT)
  const chainId = ChainId.ETHEREUM

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  it('adds single record and queries it', async () => {
    const record = {
      id: 'id',
      height: 1,
      chainId,
      configHash: Hash256.random(),
    }

    await repository.addOrUpdate(record)

    const actual = await repository.getAll()

    expect(actual).toEqual([record])
  })

  it('updates existing record', async () => {
    const record = {
      id: 'id',
      height: 1,
      chainId,
      configHash: Hash256.random(),
    }

    await repository.addOrUpdate(record)
    await repository.addOrUpdate({ ...record, height: 2 })

    const actual = await repository.getAll()

    expect(actual).toEqual([{ ...record, height: 2 }])
  })

  it('finds record by id', async () => {
    const record = {
      id: 'id',
      height: 1,
      chainId,
      configHash: Hash256.random(),
    }

    const record2 = {
      id: 'id2',
      height: 2,
      chainId,
      configHash: Hash256.random(),
    }

    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.findById('id2', chainId)

    expect(actual).toEqual(record2)
  })

  it('updates config hash', async () => {
    const record = {
      id: 'id',
      height: 1,
      chainId,
      configHash: Hash256.random(),
    }

    const record2 = {
      ...record,
      configHash: Hash256.random(),
    }

    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.getAll()
    expect(actual).toEqual([record2])
  })

  it('delete all records', async () => {
    await repository.addOrUpdate({
      id: 'id',
      height: 1,
      chainId,
    })
    await repository.addOrUpdate({
      id: 'id2',
      height: 2,
      chainId,
    })

    await repository.deleteAll()

    const actual = await repository.getAll()

    expect(actual).toEqual([])
  })
})
