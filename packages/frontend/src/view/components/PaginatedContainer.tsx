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
  const baseButtonClass =
    'flex h-[30px] w-[30px] items-center justify-center rounded'

  const pageTiles = Array.from({ length: amountOfPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setPage(i + 1)}
      className={cx(
        baseButtonClass,
        'transition-color duration-150',
        currentPage === i + 1 ? 'bg-gray-200' : 'hover:bg-gray-400',
      )}
    >
      {i + 1}
    </button>
  ))

  const notAllowedClass = 'bg-yellow-300 cursor-not-allowed'
  const allowedClass =
    'bg-yellow-100 transition-all brightness-100 filter hover:brightness-[120%] duration-300'

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <button
        className={cx(
          baseButtonClass,
          'rotate-180',
          currentPage === 1 ? notAllowedClass : allowedClass,
        )}
        onClick={() => setPage(Math.max(currentPage - 1, 1))}
      >
        <SimpleArrowIcon />
      </button>

      {pageTiles}

      <button
        className={cx(
          baseButtonClass,
          currentPage === amountOfPages ? notAllowedClass : allowedClass,
        )}
        onClick={() => setPage(Math.min(currentPage + 1, amountOfPages))}
      >
        <SimpleArrowIcon />
      </button>
    </div>
  )
}
