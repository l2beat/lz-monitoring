import cx from 'classnames'
import React from 'react'

import { SimpleArrowIcon } from '../icons/SimpleArrowIcon'

interface Props {
  children: React.ReactNode[]
  itemsPerPage: number
  page: number
}

export function PaginatedContainer({ children, itemsPerPage, page }: Props) {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedItems = children.slice(startIndex, endIndex)

  return (
    <React.Fragment>
      {paginatedItems.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </React.Fragment>
  )
}

export function PaginationControls({
  amountOfPages,
  currentPage,
  setPage,
}: {
  amountOfPages: number
  currentPage: number
  setPage: (page: number) => void
}) {
  const pageTiles = Array.from({ length: amountOfPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setPage(i + 1)}
      className={cx(
        'flex min-h-[30px] min-w-[30px] items-center justify-center rounded transition-colors hover:bg-gray-50',
        currentPage === i + 1 && 'bg-gray-50',
      )}
    >
      {i + 1}
    </button>
  ))

  const baseButtonClass =
    'bg-yellow-100 flex h-[30px] w-[30px] items-center  transition-all duration-300 justify-center rounded brightness-100 filter hover:brightness-[120%]'

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        className={cx(baseButtonClass, 'rotate-180')}
        onClick={() => setPage(Math.max(currentPage - 1, 1))}
      >
        <SimpleArrowIcon />
      </button>

      {pageTiles}

      <button
        className={baseButtonClass}
        onClick={() => setPage(Math.min(currentPage + 1, amountOfPages))}
      >
        <SimpleArrowIcon />
      </button>
    </div>
  )
}
