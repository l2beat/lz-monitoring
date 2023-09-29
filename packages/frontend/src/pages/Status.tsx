import { DiscoveryStatus } from '@lz/libs'
import cx from 'classnames'

import { config } from '../config'
import { useStatusApi } from '../hooks/useStatusApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { StatusSection } from '../view/components/status/StatusSection'
import { getOverallHealth, Health } from '../view/components/status/statusUtils'

export function Status(): JSX.Element {
  const [status] = useStatusApi({ apiUrl: config.apiUrl })

  if (!status) {
    return (
      <>
        <Navbar />
        <Layout>
          <div className="flex justify-between">
            <div className="mb-12 text-xxl font-bold">
              System health & status
            </div>
            <div className={`mb-12 text-xxl font-bold`}>⏳</div>
          </div>
        </Layout>
      </>
    )
  }

  const systemHealth = getMinimalHealth(status)

  const systemIcon = systemHealth === 'healthy' ? '🟢' : '⚠️'

  const systemHealthColor =
    systemHealth === 'healthy' ? 'text-[#63f542]' : 'text-[#f5c842]'

  return (
    <>
      <Navbar />
      <Layout>
        <div className="flex justify-between">
          <div className="mb-12 text-xxl font-bold">System health & status</div>
          <div>
            <span>System is </span>
            <span className={cx('font-bold', systemHealthColor)}>
              {systemHealth} {systemIcon}
            </span>
          </div>
        </div>
        {status.map((chainStatus) => (
          <StatusSection status={chainStatus} />
        ))}
      </Layout>
    </>
  )
}

function getMinimalHealth(systemState: DiscoveryStatus[]): Health {
  const anyUnhealthy = systemState.some(
    // Fix this ugh
    (chainStatus) => typeof getOverallHealth(chainStatus) === 'string',
  )

  return anyUnhealthy ? 'unhealthy' : 'healthy'
}
