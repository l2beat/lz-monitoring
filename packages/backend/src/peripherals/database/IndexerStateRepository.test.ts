import { Logger } from '@l2beat/backend-tools'
import { expect } from 'earl'

import { setupDatabaseTestSuite } from '../../test/database'
import { IndexerStateRepository } from './IndexerStateRepository'

describe(IndexerStateRepository.name, () => {
  const { database } = setupDatabaseTestSuite()
  const repository = new IndexerStateRepository(database, Logger.SILENT)

  before(() => repository.deleteAll())
  afterEach(() => repository.deleteAll())

  it('adds single record and queries it', async () => {
    const record = {
      id: 'id',
      height: 1,
    }

    await repository.addOrUpdate(record)

    const actual = await repository.getAll()

    expect(actual).toEqual([record])
  })

  it('updates existing record', async () => {
    const record = {
      id: 'id',
      height: 1,
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
    }

    const record2 = {
      id: 'id2',
      height: 2,
    }

    await repository.addOrUpdate(record)
    await repository.addOrUpdate(record2)

    const actual = await repository.findById('id2')

    expect(actual).toEqual(record2)
  })

  it('delete all records', async () => {
    await repository.addOrUpdate({
      id: 'id',
      height: 1,
    })
    await repository.addOrUpdate({
      id: 'id2',
      height: 2,
    })

    await repository.deleteAll()

    const actual = await repository.getAll()

    expect(actual).toEqual([])
  })
})
