import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import type { Table } from '@tanstack/react-table'

interface PaginationControlsProps {
  table: Table<any>
  isFetching?: boolean
  totalRows?: number
  className?: string
}

export function PaginationControls({
  table,
  isFetching = false,
  totalRows,
  className = '',
}: PaginationControlsProps): React.ReactElement {
  const pagination = table.getState().pagination
  const pageCount = table.getPageCount()
  const currentPage = pagination.pageIndex + 1
  const pageSize = pagination.pageSize
  const rowCount = totalRows ?? 0

  const startRow = pagination.pageIndex * pageSize + 1
  const endRow = Math.min(
    startRow + table.getRowModel().rows.length - 1,
    rowCount,
  )

  const pageSizeOptions = [10, 20, 50]

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3 bg-gray-50 rounded-lg ${className}`}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Left side: Row count info */}
      <div className="flex items-center text-sm text-gray-600">
        <span aria-live="polite">
          {rowCount > 0 ? (
            <>
              Showing{' '}
              <span className="font-medium">{startRow.toLocaleString()}</span>{' '}
              to <span className="font-medium">{endRow.toLocaleString()}</span>{' '}
              of{' '}
              <span className="font-medium">{rowCount.toLocaleString()}</span>{' '}
              results
            </>
          ) : (
            'No results'
          )}
        </span>
        {isFetching && (
          <span className="ml-2 flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </span>
        )}
      </div>

      {/* Right side: Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        <label htmlFor="page-size-select" className="text-sm text-gray-600">
          Rows per page
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          aria-label="Rows per page"
          disabled={isFetching}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {/* Page info */}
        <span
          className="text-sm text-gray-600 whitespace-nowrap"
          aria-live="polite"
        >
          Page {pageCount > 0 ? currentPage : 0} of {pageCount}
        </span>

        {/* Navigation buttons */}
        <div
          className="flex items-center gap-1"
          role="group"
          aria-label="Page navigation"
        >
          {/* First page */}
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage() || isFetching}
            className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isFetching}
            className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Next page */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isFetching}
            className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Last page */}
          <button
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage() || isFetching}
            className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
