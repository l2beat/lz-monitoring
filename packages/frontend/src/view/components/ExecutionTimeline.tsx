import { EthereumAddress } from '@lz/libs'
import cx from 'classnames'

import { BlockchainAddress } from './BlockchainAddress'

type Outcome = 'PENDING' | 'EXECUTED' | 'DISCARDED'

interface Approval {
  signer: EthereumAddress
  date: Date
  method?: string
}

interface Props {
  outcome: Outcome
  approvals: Approval[]
  submissionDate: Date
}

export function ExecutionTimeline({
  outcome,
  approvals,
  submissionDate,
}: Props) {
  const outcomeVariant =
    outcome === 'PENDING' ? 'orange' : outcome === 'EXECUTED' ? 'green' : 'red'
  const outcomeNode = (
    <TimelineNode variant={outcomeVariant} size="large">
      <span className={cx('font-semibold', variantToTextColor(outcomeVariant))}>
        {outcome}
      </span>
      {outcomeToDescription(outcome)}
    </TimelineNode>
  )
  const outcomeTimeline = <Timeline variant={outcomeVariant} />

  const approvalNodes = approvals.map((approval, i) => (
    <>
      <TimelineNode key={i} variant="orange" size="small">
        <span className={cx('font-medium', variantToTextColor('orange'))}>
          Approved
        </span>
        <BlockchainAddress address={approval.signer} />
        <span className="text-gray-50">
          {approval.date.toLocaleString()}{' '}
          {approval.method && `via ${approval.method}`}
        </span>
      </TimelineNode>
      <Timeline variant="orange" />
    </>
  ))

  const submissionNode = (
    <TimelineNode variant="gray" size="large">
      <div className={cx('font-medium', variantToTextColor('gray'))}>
        Submitted
      </div>
      <div>{submissionDate.toLocaleString()}</div>
    </TimelineNode>
  )

  return (
    <div className="mb-5 flex max-w-fit flex-col items-center">
      {outcomeNode}
      {outcomeTimeline}
      {approvalNodes}
      {submissionNode}
    </div>
  )
}

type Variant = 'green' | 'orange' | 'gray' | 'red'
type Size = 'small' | 'large'

function Timeline({ variant }: { variant: Variant }) {
  return (
    <div className={cx('h-[52px] w-px', variantToBackgroundColor(variant))} />
  )
}

function TimelineNode({
  children,
  variant,
  size,
}: {
  children: React.ReactNode
  variant: Variant
  size: Size
}) {
  const sizeClass = size === 'small' ? 'h-2.5 w-2.5' : 'h-[13px] w-[13px]'
  const sizeOffset = size === 'small' ? '-top-0.5 left-5' : 'top-0 left-6'

  return (
    <div
      className={cx(
        'rounded-full',
        variantToBackgroundColor(variant),
        sizeClass,
      )}
    >
      <div
        className={cx(
          'relative left-5 flex w-[390px] flex-col gap-1.5',
          sizeOffset,
        )}
      >
        {children}
      </div>
    </div>
  )
}

function variantToTextColor(variant: Variant) {
  return variant === 'green'
    ? 'text-[#55E095]'
    : variant === 'orange'
    ? 'text-[#EE964B]'
    : variant === 'gray'
    ? 'text-gray-15'
    : 'text-[#E74C3C]'
}

function variantToBackgroundColor(variant: Variant) {
  return variant === 'green'
    ? 'bg-[#55E095]'
    : variant === 'orange'
    ? 'bg-[#EE964B]'
    : variant === 'gray'
    ? 'bg-gray-15'
    : 'bg-[#E74C3C]'
}

function outcomeToDescription(outcome: Outcome) {
  if (outcome === 'EXECUTED') {
    return 'The transaction was executed successfully.'
  }

  if (outcome === 'DISCARDED') {
    return 'A new transaction with an identical nonce has been submitted.'
  }

  return 'Transaction is waiting for signatures.'
}
