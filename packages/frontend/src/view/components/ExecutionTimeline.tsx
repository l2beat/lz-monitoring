import cx from 'classnames'

type Outcome = 'PENDING' | 'EXECUTED' | 'DISCARDED'

interface Approval {
  signer: string
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
        {approval.signer}
        <span className="text-gray-600">
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
    <div
      className={cx('h-[52px] w-[1px]', variantToBackgroundColor(variant))}
    />
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
  const sizeClass = size === 'small' ? 'h-[10px] w-[10px]' : 'h-[13px] w-[13px]'
  const sizeOffset = size === 'small' ? 'top-[-2px] left-5' : 'top-[0px] left-6'

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
    ? 'text-gray-500'
    : 'text-[#E74C3C]'
}

function variantToBackgroundColor(variant: Variant) {
  return variant === 'green'
    ? 'bg-[#55E095]'
    : variant === 'orange'
    ? 'bg-[#EE964B]'
    : variant === 'gray'
    ? 'bg-gray-500'
    : 'bg-[#E74C3C]'
}

function outcomeToDescription(outcome: Outcome) {
  if (outcome === 'EXECUTED') {
    return 'The transaction was executed successfully'
  }

  if (outcome === 'DISCARDED') {
    return 'Another transactions with same nonce has been submitted'
  }

  return 'Transaction is waiting for confirmations'
}
