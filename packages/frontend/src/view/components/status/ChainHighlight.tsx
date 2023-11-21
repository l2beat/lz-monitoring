import { DiscoveryStatus } from '@lz/libs'

export function ChainHighlight(props: { chain: DiscoveryStatus['chainId'] }) {
  const chainId = props.chain.valueOf()

  return (
    <span className="p-2 text-md text-[#807c70]">EVM chainID: {chainId}</span>
  )
}
