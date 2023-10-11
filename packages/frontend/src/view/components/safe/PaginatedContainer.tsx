import { useEffect, useState } from 'react'

import { NextPageIcon } from '../../icons/NextPageIcon'

export function PaginatedContainer<T extends React.ReactNode>({
  children,
  itemsPerPage,
}: {
  children: T[]
  itemsPerPage: number
}) {
  const [page, setPage] = useState(1)

  const maxPage = Math.ceil(children.length / itemsPerPage)

  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedItems = children.slice(startIndex, endIndex)

  function normalizePage() {
    if (page > maxPage || page < 1) {
      setPage(1)
    }
  }

  useEffect(() => {
    normalizePage()
  })

  function nextPage() {
    setPage((page) => Math.min(page + 1, maxPage))
  }

  function previousPage() {
    setPage((page) => Math.max(page - 1, 1))
  }

  return (
    <div>
      <PaginatedContainerControls
        maxPage={maxPage}
        nextPage={nextPage}
        previousPage={previousPage}
        currentPage={page}
      />
      {paginatedItems.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  )
}

function PaginatedContainerControls(props: {
  maxPage: number
  currentPage: number
  nextPage: () => void
  previousPage: () => void
}) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between px-10 py-4">
        <button onClick={props.previousPage}>
          <NextPageIcon className="rotate-180" />
        </button>
        <span className="text-lg font-semibold">
          {props.currentPage} / {props.maxPage}
        </span>
        <button onClick={props.nextPage}>
          <NextPageIcon />
        </button>
      </div>
    </>
  )
}
