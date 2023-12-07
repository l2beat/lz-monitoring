import { ChangelogApiEntry, EthereumAddress, UnixTime } from '@lz/libs'
import cx from 'classnames'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { config } from '../../../config'
import { useChainId } from '../../../hooks/chainIdContext'
import { useChangelogApi } from '../../../hooks/useChangelogApi'
import {
  categories,
  Category,
  useChangelogCategories,
} from '../../../hooks/useChangelogCategories'
import { CloseIcon } from '../../icons/CloseIcon'
import { Tooltip } from '../Tooltip'
import { ChangelogEntry } from './ChangelogEntry'

interface ChangelogSummaryProps {
  address: EthereumAddress
}

export function ChangelogSummary(props: ChangelogSummaryProps) {
  const chainId = useChainId()
  const [data, isLoading, isError] = useChangelogApi({
    shouldFetch: true,
    chainId: chainId,
    address: props.address,
    apiUrl: config.apiUrl,
  })

  const [filteredData, category, setCategory] = useChangelogCategories(
    data.perDay ?? new Map<number, ChangelogApiEntry[]>(),
  )
  const [changesDetails, setChangesDetails] = useState<
    null | ChangelogApiEntry[]
  >(null)

  // reset changes details when chainId changes
  useEffect(() => {
    setChangesDetails(null)
  }, [chainId, category])

  if (isError) {
    return <div>Failed to load changelog</div>
  }

  return (
    <>
      <div className="mb-4 rounded-lg bg-gray-800 px-6 py-4">
        <h3 className="mb-3 font-medium">Changelog</h3>
        <div className="relative mb-3 flex items-center gap-1">
          {Object.entries(categories).map(([id, name], i) => (
            <button
              key={i}
              className={cx(
                'rounded-full px-3 py-1.5 text-2xs font-medium',
                id === category
                  ? 'bg-yellow-100 text-black'
                  : 'bg-zinc-700 hover:bg-gray-200',
              )}
              onClick={() => setCategory(id as Category)}
            >
              {name}
            </button>
          ))}
        </div>

        <Year
          startTimestamp={data.startTimestamp}
          changelogPerDay={filteredData}
          availableYears={data.availableYears}
          setChangesDetails={setChangesDetails}
          isLoading={isLoading}
        />
        {changesDetails && (
          <>
            <div className="my-6 flex items-center justify-between">
              <span className="font-medium">
                {changesDetails[0]?.timestamp.toMMDDYYYY()}
              </span>
              <button onClick={() => setChangesDetails(null)}>
                <CloseIcon />
              </button>
            </div>

            {changesDetails.map((change, i) => (
              <ChangelogEntry key={i} change={change} />
            ))}
          </>
        )}
      </div>
    </>
  )
}

interface YearProps {
  startTimestamp: UnixTime | null
  availableYears: number[] | null
  changelogPerDay: Map<number, ChangelogApiEntry[]> | null
  setChangesDetails: (changes: ChangelogApiEntry[]) => void
  isLoading: boolean
}

function Year(props: YearProps) {
  const currentYear = new Date().getUTCFullYear()
  const [year, setYear] = useState<number>(currentYear)

  const allWeeks = getAllWeeks(year)
  const firstDay = new Date(Date.UTC(year, 0, 1))
  let currDay = UnixTime.fromDate(firstDay).add(-1, 'days')

  if (props.isLoading) {
    return (
      <YearWrapper
        year={year}
        setYear={setYear}
        availableYears={props.availableYears ?? [currentYear]}
      >
        <Skeleton
          containerClassName="flex flex-col [&>br]:hidden gap-2 py-1"
          count={7}
          className="h-3 rounded-md"
        />
      </YearWrapper>
    )
  }

  return (
    <YearWrapper
      year={year}
      setYear={setYear}
      availableYears={props.availableYears ?? [currentYear]}
    >
      <div className="flex">
        {allWeeks.map((week, i) => (
          <div className="flex flex-col" key={i}>
            {week.map((day, j) => {
              if (day === '0') {
                currDay = currDay.add(1, 'days')
              }

              const changes = props.changelogPerDay?.get(currDay.toNumber())

              return (
                <Square
                  key={`${i}-${j}`}
                  active={day === '0'}
                  date={currDay.toDate()}
                  startDate={props.startTimestamp?.toDate() ?? null}
                  changes={changes ?? []}
                  setChangesDetails={props.setChangesDetails}
                />
              )
            })}
          </div>
        ))}
      </div>
    </YearWrapper>
  )
}

function YearWrapper(props: {
  children: React.ReactNode
  availableYears: number[]
  year: number
  setYear: (year: number) => void
}) {
  return (
    <div className="flex gap-1.5">
      <div className="mt-6 flex flex-col items-center gap-2 pb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <div key={i} className="h-3 text-xs font-semibold text-gray-200">
            {day}
          </div>
        ))}
      </div>
      <div className="shrink overflow-x-auto pb-2 scrollbar scrollbar-track-gray-400 scrollbar-thumb-yellow-100">
        <div className="mb-2 flex w-[847px] justify-around">
          {[
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ].map((month, i) => (
            <div key={i} className="h-3 text-xs font-semibold text-gray-200">
              {month}
            </div>
          ))}
        </div>
        {props.children}
      </div>
      <VerticalDivider />
      <YearSelector
        year={props.year}
        setYear={props.setYear}
        availableYears={props.availableYears}
      />
    </div>
  )
}

interface SquareProps {
  startDate: Date | null
  date: Date
  active: boolean
  changes: ChangelogApiEntry[]
  setChangesDetails: (changes: ChangelogApiEntry[]) => void
}
function Square(props: SquareProps) {
  const hasChanges = props.changes.length > 0
  const isExcluded =
    (props.startDate && props.date < props.startDate) || props.date > new Date()

  const text = getText(props.changes.length, props.date)
  const color = getColor(props.changes.length, isExcluded)

  return (
    <Tooltip text={text} disabled={isExcluded || !props.active}>
      <div className="px-0.5 py-1">
        <div
          className={cx(
            'h-3 w-3',
            props.active && color,
            hasChanges && 'cursor-pointer',
          )}
          onClick={() => {
            if (hasChanges) {
              props.setChangesDetails(props.changes)
            }
          }}
        />
      </div>
    </Tooltip>
  )
}

function getText(changesNumber: number, date: Date) {
  let text = ''
  if (changesNumber === 0) {
    text = 'No changes on '
  } else if (changesNumber === 1) {
    text = '1 change on '
  } else {
    text = changesNumber.toString() + ' changes on '
  }

  return text + date.toDateString()
}

function getColor(changesNumber: number, isExcluded: boolean) {
  if (isExcluded) {
    return 'bg-gray-700'
  }

  const steps = {
    1: 'bg-yellow-300',
    2: 'bg-yellow-200',
    10: 'bg-yellow-100',
  }

  // assign color based on number of changes
  const color = Object.entries(steps).reduce((acc, [step, color]) => {
    if (changesNumber >= parseInt(step)) {
      return color
    }
    return acc
  }, 'bg-yellow-500')

  return color
}

interface YearSelectorProps {
  availableYears: number[]
  year: number
  setYear: (year: number) => void
}

function YearSelector(props: YearSelectorProps) {
  if (!props.availableYears.includes(props.year)) {
    const currentYear = new Date().getUTCFullYear()
    props.setYear(currentYear)
  }

  return (
    <div className="mt-6 flex flex-col gap-1.5">
      {props.availableYears.map((year, i) => (
        <button
          key={i}
          className={cx(
            'rounded-full px-2 py-1.5 text-2xs',
            props.year === year
              ? 'bg-yellow-100 text-black'
              : 'bg-zinc-700 hover:bg-gray-200',
          )}
          onClick={() => props.setYear(year)}
        >
          {year}
        </button>
      ))}
    </div>
  )
}

function VerticalDivider() {
  return <div className="mb-3 mt-6 w-0 border-l border-zinc-500" />
}

function getAllWeeks(year: number) {
  /**
   * generate array of a year divided by weeks
   * M _ 0 ... 0 0
   * T _ 0 ... 0 0
   * W _ 0 ... 0 0
   * T 0 0 ... 0 _
   * F 0 0 ... 0 _
   * S 0 0 ... 0 _
   * S 0 0 ... 0 _
   */
  const firstDay = new Date(year, 0, 1)
  const firstWeekday = firstDay.getUTCDay()
  const daysInYear = 365 + (firstDay.getFullYear() % 4 === 0 ? 1 : 0)
  const firstWeek = Array.from({ length: 7 }, (_, i) =>
    i >= firstWeekday ? '0' : '_',
  )
  const lastWeekday = (daysInYear + firstWeekday - 1) % 7
  const lastWeek = Array.from({ length: 7 }, (_, i) =>
    i <= lastWeekday ? '0' : '_',
  )
  const remaining = daysInYear - (7 - firstWeekday) - lastWeekday
  const middleWeeks = Array.from({ length: remaining / 7 }, () =>
    Array.from({ length: 7 }, () => '0'),
  )
  return [firstWeek, ...middleWeeks, lastWeek]
}
