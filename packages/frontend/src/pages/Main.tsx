import { config } from '../config'
import { useAvailableChains } from '../hooks/useAvailableChains'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { ProtocolInformation } from '../view/components/protocol/ProtocolInformation'
import { Warning } from '../view/components/Warning'

export function Main() {
  const [availableChains, isLoading, isError] = useAvailableChains({
    apiUrl: config.apiUrl,
  })

  const chainsToDisplay = availableChains.visible.map((c) => c.chainId)

  if (isLoading) {
    return
  }

  if (isError || chainsToDisplay.length === 0) {
    return (
      <>
        <Navbar />
        <Layout>
          <Warning
            title="Could not load available chains"
            subtitle="Chains might be disabled globally or unreachable. Please try again later."
          />
        </Layout>
      </>
    )
  }

  // It should not happen since we already have check above
  assertAtLeastOneItem(chainsToDisplay)

  return (
    <>
      <Navbar />
      <ProtocolInformation chainsToDisplay={chainsToDisplay} />
    </>
  )
}

function assertAtLeastOneItem<T>(arr: T[]): asserts arr is [T, ...T[]] {
  if (arr.length === 0) {
    throw new Error('At least one item is required')
  }
}
