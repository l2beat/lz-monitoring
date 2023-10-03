import { config } from '../config'
import { useStatusApi } from '../hooks/useStatusApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { OverallHealth } from '../view/components/status/OverallHealth'
import { StatusSection } from '../view/components/status/StatusSection'

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

  return (
    <>
      <Navbar />
      <Layout>
        <div className="flex justify-between">
          <div className="mb-12 text-xxl font-bold">System health & status</div>
          <OverallHealth status={status} />
        </div>
        {status.map((chainStatus, i) => (
          <StatusSection key={i} status={chainStatus} />
        ))}
      </Layout>
    </>
  )
}
