import { ChainId, DiscoveryStatus, getPrettyChainName } from '@lz/libs'
import cx from 'classnames'
import React, { HTMLAttributes, useState } from 'react'

import { config } from '../config'
import { useStatusApi } from '../hooks/useStatusApi'
import { Layout } from '../view/components/Layout'
import { Navbar } from '../view/components/Navbar'
import { OverallHealth } from '../view/components/status/OverallHealth'
import { StatusSection } from '../view/components/status/StatusSection'
import { getOverallHealth } from '../view/components/status/statusUtils'
import { FocusLockIcon } from '../view/icons/FocusLockIcon'
import { PlusIcon } from '../view/icons/PlusIcon'
import { RefreshIcon } from '../view/icons/RefreshIcon'

export function Status(): JSX.Element {
  const [status, isLoading, , forceFetch] = useStatusApi({
    apiUrl: config.apiUrl,
  })
  const [unhealthyOnly, setUnhealthyOnly] = useState(false)
  const [hiddenOnly, setHiddenOnly] = useState(false)
  const [disabledOnly, setDisabledOnly] = useState(false)
  const [focusedChain, setFocusedChain] = useState<ChainId | null>(null)

  interface Filter {
    shouldDispatch: boolean
    filter: (statuses: DiscoveryStatus[]) => DiscoveryStatus[]
  }

  const filterMap: Filter[] = [
    {
      shouldDispatch: unhealthyOnly,
      filter: (statuses) =>
        statuses.filter((s) => getOverallHealth(s).health === 'unhealthy'),
    },
    {
      shouldDispatch: hiddenOnly,
      filter: (statuses) => statuses.filter((s) => !s.visible),
    },
    {
      shouldDispatch: disabledOnly,
      filter: (statuses) => statuses.filter((s) => s.state === 'disabled'),
    },
    {
      shouldDispatch: focusedChain !== null,
      filter: (statuses) => statuses.filter((s) => s.chainId === focusedChain),
    },
  ]

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

  // AND logic manner
  const filteredStatuses = filterMap.reduce(
    (acc, filter) => (filter.shouldDispatch ? filter.filter(acc) : acc),
    status,
  )

  return (
    <>
      <Navbar />
      <Layout>
        <div className="flex justify-between">
          <div className="mb-12 text-xxl font-bold">System health & status</div>
          <OverallHealth status={status} />
        </div>
        <div className="mb-14 flex flex-col gap-4 border-y-2 border-[#234354] bg-gray-900 p-6">
          <div className="flex justify-between text-xl">
            <span>Filters</span>
            <div
              className={cx(
                'flex h-6 w-6 cursor-pointer items-center justify-between transition-all duration-300 hover:rotate-[12deg]',
                isLoading && 'animate-spin',
              )}
              onClick={() => void forceFetch()}
            >
              <RefreshIcon fill="#FFFFFF" className="-scale-x-[1]" />
            </div>
          </div>

          <div className="flex gap-10">
            {focusedChain ? (
              <InlineLabel onClick={() => setFocusedChain(null)}>
                <FocusLockIcon fill="#FFFFFF" />
                Focus is locked on {getPrettyChainName(focusedChain)}
              </InlineLabel>
            ) : (
              <>
                <Checkbox
                  checked={unhealthyOnly}
                  onClick={setUnhealthyOnly}
                  label="Only unhealthy"
                />
                <Checkbox
                  checked={hiddenOnly}
                  onClick={setHiddenOnly}
                  label="Only hidden"
                />
                <Checkbox
                  checked={disabledOnly}
                  onClick={setDisabledOnly}
                  label="Only disabled"
                />
              </>
            )}
          </div>
        </div>
        {filteredStatuses.map((chainStatus, i) => (
          <StatusSection
            key={i}
            status={chainStatus}
            focusedChain={focusedChain}
            setFocusedChainId={setFocusedChain}
          />
        ))}
      </Layout>
    </>
  )
}

function InlineLabel(
  props: HTMLAttributes<HTMLLabelElement> & { children: React.ReactNode },
) {
  return (
    <label
      className="flex cursor-pointer items-center justify-center gap-2 p-1 text-lg"
      {...props}
    >
      {props.children}
    </label>
  )
}

function Checkbox(props: {
  checked: boolean
  onClick: (isChecked: boolean) => void
  label: string
}) {
  return (
    <InlineLabel onClick={() => props.onClick(!props.checked)}>
      <span
        className={cx(
          'flex h-7 w-7 items-center justify-center bg-gray-600 p-1 text-white',
        )}
      >
        {props.checked && <PlusIcon className="rotate-45" fill="#FFFFFF" />}
      </span>
      {props.label}
    </InlineLabel>
  )
}
