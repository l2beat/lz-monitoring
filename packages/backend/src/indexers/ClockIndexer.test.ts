import { Logger } from '@l2beat/backend-tools'
import { ChildIndexer } from '@l2beat/uif'
import { ChainId } from '@lz/libs'
import { install, InstalledClock } from '@sinonjs/fake-timers'
import { expect } from 'earl'
import { spy } from 'sinon'

import { ClockIndexer } from './ClockIndexer'

describe(ClockIndexer.name, () => {
  let clock: InstalledClock

  beforeEach(() => {
    clock = install({ shouldAdvanceTime: true, advanceTimeDelta: 1 })
  })

  afterEach(() => {
    clock.uninstall()
  })

  it('produces predictable amount of tick resulting in updates', async () => {
    const tickInterval = 10 * 1000 // 10s
    const expectedUpdateCount = 5

    const clockIndexer = new ClockIndexer(
      Logger.SILENT,
      ChainId.ETHEREUM,
      tickInterval,
    )

    const testChildIndexer = new TestChildIndexer(Logger.SILENT, [clockIndexer])

    const spied = spy(testChildIndexer, 'update')

    await clockIndexer.start()
    await testChildIndexer.start()

    await clock.tickAsync(tickInterval * expectedUpdateCount)

    expect(spied.callCount).toEqual(expectedUpdateCount)
  })
})

class TestChildIndexer extends ChildIndexer {
  private safeHeight = 0
  override getSafeHeight(): Promise<number> {
    return Promise.resolve(this.safeHeight)
  }

  override setSafeHeight(height: number): Promise<void> {
    this.safeHeight = height
    return Promise.resolve()
  }

  override update(_from: number, to: number): Promise<number> {
    return Promise.resolve(to)
  }

  override invalidate(targetHeight: number): Promise<number> {
    this.safeHeight = targetHeight

    return Promise.resolve(targetHeight)
  }
}
