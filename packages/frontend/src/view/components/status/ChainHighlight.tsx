import { DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

export function ChainHighlight(props: { chain: DiscoveryStatus['chainId'] }) {
  const chainId = props.chain.valueOf()

  return <span className={cx('p-2 text-md text-[#807c70]')}>ID: {chainId}</span>
}
