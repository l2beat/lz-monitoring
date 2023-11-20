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
        'flex min-h-[30px] min-w-[30px] items-center justify-center rounded hover:bg-gray-50',
        currentPage === i + 1 && 'bg-gray-50',
      )}
    >
      {i + 1}
    </button>
  ))

  return (
    <div className="flex items-center gap-1 md:gap-3">
      <button
        className="flex h-[30px] w-[30px] rotate-180 items-center justify-center rounded bg-yellow"
        onClick={() => setPage(currentPage - 1)}
      >
        <SimpleArrowIcon />
      </button>

      {pageTiles}

      <button
        className="flex h-[30px] w-[30px] items-center justify-center rounded bg-yellow"
        onClick={() => setPage(currentPage + 1)}
      >
        <SimpleArrowIcon />
      </button>
    </div>
  )
}
