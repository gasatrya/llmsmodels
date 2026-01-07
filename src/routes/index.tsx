import React, { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { z } from 'zod'
import type {
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import type { ColumnVisibilityState } from '@/types/column-visibility'
import type { FlattenedModel } from '@/types/models'
import type { SimpleFiltersState } from '@/types/filters'
import { ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from '@/types/column-visibility'
import { getModels, modelsQueryOptions } from '@/lib/models'
import { modelColumns } from '@/lib/model-columns'
import { PaginationControls } from '@/components/PaginationControls'
import { ModelList } from '@/components/ModelList'
import { SearchBar } from '@/components/SearchBar'
import { SimplifiedFilters } from '@/components/SimplifiedFilters'
import { ColumnVisibilityToggle } from '@/components/ColumnVisibilityToggle'

// Define search params schema
const indexSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().default(''),
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

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
    searchQuery: search.search,
    reasoning: search.reasoning,
    toolCall: search.toolCall,
    openWeights: search.openWeights,
  }),
  loader: async ({ deps, context }) => {
    return context.queryClient.ensureQueryData(
      modelsQueryOptions({
        page: deps.page,
        limit: deps.limit,
        search: deps.searchQuery,
        reasoning: deps.reasoning,
        toolCall: deps.toolCall,
        openWeights: deps.openWeights,
      }),
    )
  },
  component: IndexPage,
})

function IndexPage() {
  // Use TanStack Router's Route.useSearch hook (SSR-safe, typed based on validateSearch schema)
  const search = Route.useSearch()

  // Use TanStack Router's navigate function
  const navigate = Route.useNavigate()

  // Query with params from URL (SSR-safe)
  const { data: ssrdata } = useSuspenseQuery(
    modelsQueryOptions({
      page: search.page,
      limit: search.limit,
      search: search.search,
      reasoning: search.reasoning,
      toolCall: search.toolCall,
      openWeights: search.openWeights,
    }),
  )

  // Pagination state from URL or defaults
  const [pagination, setPagination] = useState<PaginationState>(() => {
    return {
      pageIndex: search.page - 1,
      pageSize: search.limit,
    }
  })

  // Sorting and row selection state
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Global filter state (synced with TanStack Table, initialized from URL)
  const [globalFilter, setGlobalFilter] = useState<string>(() => {
    return search.search
  })

  // Filter state for reasoning, toolCall, and openWeights (synced with URL)
  const [filters, setFilters] = useState<SimpleFiltersState>(() => ({
    reasoning: search.reasoning ?? undefined,
    toolCall: search.toolCall ?? undefined,
    openWeights: search.openWeights ?? undefined,
  }))

  // Initialize column visibility with defaults (pure in-memory state)
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(() => {
      return Object.fromEntries(
        ALL_COLUMNS.map((col) => [
          col.id,
          DEFAULT_VISIBLE_COLUMNS.includes(col.id),
        ]),
      )
    })

  // Query with pagination
  const modelsQuery = useQuery({
    queryKey: ['models', pagination, globalFilter, filters],
    queryFn: async () => {
      const response = await getModels({
        data: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
          reasoning: filters.reasoning,
          toolCall: filters.toolCall,
          openWeights: filters.openWeights,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    },
    placeholderData: keepPreviousData,
    initialData: ssrdata,
  })

  // Table with manual pagination
  const table = useReactTable({
    data: modelsQuery.data.data,
    columns: modelColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // Server-side pagination
    manualPagination: true,
    rowCount: modelsQuery.data.pagination.total,

    // Server-side filtering
    manualFiltering: true,

    state: {
      pagination,
      sorting,
      rowSelection,
      globalFilter,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    // @ts-expect-error - filterFns is required due to module augmentation in demo/table.tsx but we don't use it
    filterFns: {},
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => `${row.providerId}-${row.modelId}`,
  })

  // Update URL when pagination changes
  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }),
    })
  }, [pagination, navigate, search])

  // Update URL when search changes
  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: globalFilter || undefined,
      }),
    })
  }, [globalFilter, navigate, search])

  // Update URL when filters change
  useEffect(() => {
    // Only navigate if URL values differ from current filter state to prevent infinite loops
    if (
      search.reasoning === filters.reasoning &&
      search.toolCall === filters.toolCall &&
      search.openWeights === filters.openWeights
    ) {
      return
    }

    navigate({
      search: (prev) => ({
        ...prev,
        reasoning:
          filters.reasoning === undefined ? undefined : filters.reasoning,
        toolCall: filters.toolCall === undefined ? undefined : filters.toolCall,
        openWeights:
          filters.openWeights === undefined ? undefined : filters.openWeights,
      }),
    })
  }, [filters, navigate, search])

  const selectedRows = table.getSelectedRowModel().rows
  const totalCount = modelsQuery.data.pagination.total

  if (modelsQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Models Explorer
          </h1>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">
            Error loading models. Please try again.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Models Explorer</h1>
        <p className="text-gray-600 mt-2">
          Browse and compare {totalCount.toLocaleString()} AI models
        </p>
      </header>

      <div className="space-y-4">
        {/* Search Bar and Column Visibility */}
        <div className="flex gap-4 items-start">
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
        <SimplifiedFilters
          filters={filters}
          onChange={setFilters}
          className="mt-4"
        />

        {/* Selection info */}
        {selectedRows.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between">
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

        {/* Table */}
        {/* isPending check is intentional for UX during page/search changes despite initialData */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {modelsQuery.isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading models...</div>
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">No models found</div>
          </div>
        ) : (
          <ModelList table={table} />
        )}

        {/* Pagination Controls */}
        <PaginationControls
          table={table}
          isFetching={modelsQuery.isFetching}
          totalRows={modelsQuery.data.pagination.total}
          className="mt-4"
        />
      </div>
    </div>
  )
}
