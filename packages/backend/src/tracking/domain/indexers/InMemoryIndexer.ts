import { ChildIndexer } from '@l2beat/uif'

export { InMemoryIndexer }

abstract class InMemoryIndexer extends ChildIndexer {
  protected height = 0
  public override getSafeHeight(): Promise<number> {
    return Promise.resolve(this.height)
  }

  protected override setSafeHeight(height: number): Promise<void> {
    this.height = height
    return Promise.resolve()
  }

  protected override invalidate(targetHeight: number): Promise<number> {
    return Promise.resolve(targetHeight)
  }
}
