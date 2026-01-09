import React, { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import { z } from 'zod'
import type { FilterFn, SortingState } from '@tanstack/react-table'
import type { ColumnVisibilityState } from '@/types/column-visibility'
import type { FlattenedModel } from '@/types/models'
import type { SimpleFiltersState } from '@/types/filters'
import { ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from '@/types/column-visibility'
import { getModels, modelsQueryOptions } from '@/lib/models'
import { modelColumns } from '@/lib/model-columns'
import { ModelList } from '@/components/ModelList'
import { SearchBar } from '@/components/SearchBar'
import { SimplifiedFilters } from '@/components/SimplifiedFilters'
import { ColumnVisibilityToggle } from '@/components/ColumnVisibilityToggle'

// Define search params schema - ONLY for deep linking/initial state
const indexSearchSchema = z.object({
  search: z.string().optional(),
  reasoning: z.preprocess((val) => {
    if (val === 'true' || val === true) return true
    return undefined
  }, z.boolean().optional()),
  toolCall: z.preprocess((val) => {
    if (val === 'true' || val === true) return true
    return undefined
  }, z.boolean().optional()),
  openWeights: z.preprocess((val) => {
    if (val === 'true' || val === true) return true
    return undefined
  }, z.boolean().optional()),
})

// Fuzzy filter function
const fuzzyFilter: FilterFn<FlattenedModel> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank,
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  loaderDeps: ({ search }) => ({
    searchQuery: search.search,
    reasoning: search.reasoning,
    toolCall: search.toolCall,
    openWeights: search.openWeights,
  }),
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(modelsQueryOptions())
  },
  component: IndexPage,
})

function IndexPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  // Fetch all models once
  const { data: response } = useSuspenseQuery(modelsQueryOptions())
  const models = response.data

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([])

  // Row selection state
  const [rowSelection, setRowSelection] = useState({})

  // Global filter state
  const [globalFilter, setGlobalFilter] = useState<string>(search.search ?? '')

  // Custom filters state
  const [filters, setFilters] = useState<SimpleFiltersState>({
    reasoning: search.reasoning,
    toolCall: search.toolCall,
    openWeights: search.openWeights,
  })

  // Column visibility state
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(() => {
      return Object.fromEntries(
        ALL_COLUMNS.map((col) => [
          col.id,
          DEFAULT_VISIBLE_COLUMNS.includes(col.id),
        ]),
      )
    })

  // Update URL when filters/search change (Debounced optional, but for now direct)
  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: globalFilter || undefined,
        reasoning: filters.reasoning || undefined,
        toolCall: filters.toolCall || undefined,
        openWeights: filters.openWeights || undefined,
      }),
      replace: true, // Replace history entry to avoid clutter
    })
  }, [globalFilter, filters, navigate])

  // Custom filter logic for specific columns
  const filteredData = useMemo(() => {
    let data = models

    if (filters.reasoning) {
      data = data.filter((m) => m.reasoning)
    }
    if (filters.toolCall) {
      data = data.filter((m) => m.toolCall)
    }
    if (filters.openWeights) {
      data = data.filter((m) => m.weights === 'Open')
    }

    return data
  }, [models, filters])

  const table = useReactTable({
    data: filteredData,
    columns: modelColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => `${row.providerId}-${row.modelId}`,
  })

  const selectedRows = table.getSelectedRowModel().rows
  const totalCount = filteredData.length

  return (
    <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
      <header className="mb-8 flex-none">
        <h1 className="text-3xl font-bold text-gray-900">AI Models Explorer</h1>
        <p className="text-gray-600 mt-2">
          Browse and compare {totalCount.toLocaleString()} AI models
        </p>
      </header>

      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        {/* Search Bar and Column Visibility */}
        <div className="flex gap-4 items-start flex-none">
          <SearchBar
            value={globalFilter}
            onChange={setGlobalFilter}
            className="max-w-md flex-1"
          />
          <ColumnVisibilityToggle
            table={table}
            onVisibilityChange={setColumnVisibility}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex-none">
          <SimplifiedFilters
            filters={filters}
            onChange={setFilters}
            className="mt-4"
          />
        </div>

        {/* Selection info */}
        {selectedRows.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between flex-none">
            <span className="font-medium">
              {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''}{' '}
              selected
            </span>
            <button
              onClick={() => setRowSelection({})}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table Area - flex-1 to fill remaining space */}
        {table.getRowModel().rows.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="text-gray-500">No models found</div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 rounded-md overflow-hidden bg-white relative">
            <ModelList table={table} />
          </div>
        )}
      </div>
    </div>
  )
}
