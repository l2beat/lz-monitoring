import { Logger } from '@l2beat/backend-tools'
import { expect } from 'earl'
import { describe } from 'mocha'

import { setupDatabaseTestSuite } from '../../../test/database'
import { BaseRepository, CheckConvention } from './BaseRepository'
import { Database } from './Database'

describe(BaseRepository.name, () => {
  const { database } = setupDatabaseTestSuite()

  describe(BaseRepository.prototype.autoWrap.name, () => {
    it('should wrap all methods', () => {
      class DummyRepository extends BaseRepository {
        constructor(database: Database, logger: Logger) {
          super(database, logger)
          this.autoWrap<CheckConvention<DummyRepository>>(this)
        }

        async addOne(): Promise<number> {
          return 1
        }

        async getAll(): Promise<string[]> {
          return []
        }

        async findBy(): Promise<string | undefined> {
          return undefined
        }

        async deleteAll(): Promise<number> {
          return 1
        }
      }
      const dummyRepository = new DummyRepository(database, Logger.SILENT)

      expect((dummyRepository.addOne as any).wrapped).toEqual(true)
      expect((dummyRepository.getAll as any).wrapped).toEqual(true)
      expect((dummyRepository.findBy as any).wrapped).toEqual(true)
      expect((dummyRepository.deleteAll as any).wrapped).toEqual(true)
    })

    it('should throw error', () => {
      class DummyRepository extends BaseRepository {
        constructor(database: Database, logger: Logger) {
          super(database, logger)
          this.autoWrap<CheckConvention<DummyRepository>>(this)
        }

        async getAll(): Promise<string[]> {
          return []
        }

        unconventionalMethodName() {
          return [1]
        }
      }

      expect(() => {
        new DummyRepository(database, Logger.SILENT)
      }).toThrow(
        Error,
        'Wrong repository method naming convention: unconventionalMethodName',
      )
    })

    it('should not wrap the function if it is prefixed with _', () => {
      class DummyRepository extends BaseRepository {
        constructor(database: Database, logger: Logger) {
          super(database, logger)
          this.autoWrap<CheckConvention<DummyRepository>>(this)
        }

        async getAll(): Promise<string[]> {
          return []
        }

        _notWrappedFunction() {
          return [1]
        }
      }
      const dummyRepository = new DummyRepository(database, Logger.SILENT)

      expect((dummyRepository.getAll as any).wrapped).toEqual(true)
      expect((dummyRepository._notWrappedFunction as any).wrapped).toBeFalsy()
    })

    it('should not wrap the function if it is wrapped manually', () => {
      class DummyRepository extends BaseRepository {
        constructor(database: Database, logger: Logger) {
          super(database, logger)

          this.refresh = this.wrapAny(this.refresh)
          this.autoWrap<CheckConvention<DummyRepository>>(this)
        }

        async getAll(): Promise<string[]> {
          return []
        }

        async refresh(): Promise<string[]> {
          return []
        }
      }

      const dummyRepository = new DummyRepository(database, Logger.SILENT)

      expect((dummyRepository.getAll as any).wrapped).toEqual(true)
      expect((dummyRepository.refresh as any).wrapped).toEqual(true)
    })
  })
})
