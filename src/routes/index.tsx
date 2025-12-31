import React, { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  keepPreviousData,
  useQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { z } from 'zod'
import type {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import type { ColumnVisibilityState } from '@/types/column-visibility'
import type { FlattenedModel } from '@/types/models'
import { getModels, modelsQueryOptions } from '@/lib/api/models'
import { getColumnVisibilityFromUrl } from '@/lib/url-state'
import { loadDefaultColumnVisibility, saveDefaultColumnVisibility  } from '@/lib/column-visibility-persistence'
import { PaginationControls } from '@/components/PaginationControls'
import { ModelList } from '@/components/ModelList/ModelList'
import { SearchBar } from '@/components/SearchBar'
import { ColumnVisibilityToggle } from '@/components/ColumnVisibilityToggle'

// Define search params schema
const indexSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().default(''),
  cols: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  loaderDeps: ({ search }) => ({
    page: search.page,
    limit: search.limit,
    searchQuery: search.search,
    cols: search.cols,
  }),
  loader: async ({ deps, context }) => {
    return context.queryClient.ensureQueryData(
      modelsQueryOptions({
        page: deps.page,
        limit: deps.limit,
        search: deps.searchQuery,
      }),
    )
  },
  component: IndexPage,
})

const columnHelper = createColumnHelper<FlattenedModel>()

const BooleanCell = ({
  value,
}: {
  value: boolean | undefined
}): React.ReactElement => {
  const boolValue = value ?? false
  return (
    <span className={boolValue ? 'text-green-600' : 'text-gray-400'}>
      {boolValue ? '✓' : '✗'}
    </span>
  )
}

const IndeterminateCheckbox = ({
  checked,
  indeterminate,
  onChange,
  disabled,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
}): React.ReactElement => {
  const ref = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean' && ref.current) {
      ref.current.indeterminate = !checked && indeterminate
    }
  }, [ref, indeterminate, checked])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
    />
  )
}

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-'
  return value.toLocaleString()
}

const formatDate = (value: string | undefined): string => {
  if (!value) return '-'
  return value
}

const modelColumns: Array<ColumnDef<FlattenedModel>> = [
  // 1. Select checkbox column
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <IndeterminateCheckbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <IndeterminateCheckbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    size: 40,
  }) as ColumnDef<FlattenedModel>,

  // 2. Provider Name
  columnHelper.accessor('providerName', {
    header: 'Provider',
    cell: (info) => info.getValue(),
    enableSorting: true,
    size: 120,
  }) as ColumnDef<FlattenedModel>,

  // 3. Model Name (bold)
  columnHelper.accessor('modelName', {
    header: 'Model',
    cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    enableSorting: true,
    size: 200,
  }) as ColumnDef<FlattenedModel>,

  // 4. Model Family
  columnHelper.accessor('modelFamily', {
    header: 'Family',
    cell: (info) => info.getValue(),
    enableSorting: true,
    size: 150,
  }) as ColumnDef<FlattenedModel>,

  // 5. Provider ID (monospace)
  columnHelper.accessor('providerId', {
    header: 'Provider ID',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    enableSorting: true,
    size: 120,
  }) as ColumnDef<FlattenedModel>,

  // 6. Model ID (monospace)
  columnHelper.accessor('modelId', {
    header: 'Model ID',
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
    enableSorting: true,
    size: 150,
  }) as ColumnDef<FlattenedModel>,

  // 7. Tool Call
  columnHelper.accessor('toolCall', {
    header: 'Tool Call',
    cell: (info) => <BooleanCell value={info.getValue()} />,
    enableSorting: true,
    size: 80,
  }) as ColumnDef<FlattenedModel>,

  // 8. Reasoning
  columnHelper.accessor('reasoning', {
    header: 'Reasoning',
    cell: (info) => <BooleanCell value={info.getValue()} />,
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 9. Input Modalities (comma-separated)
  columnHelper.accessor('inputModalities', {
    header: 'Input Modalities',
    cell: (info) => {
      const value = info.getValue<Array<string>>()
      return <span className="text-xs">{value.join(', ')}</span>
    },
    enableSorting: false,
    size: 150,
  }) as ColumnDef<FlattenedModel>,

  // 10. Output Modalities (comma-separated)
  columnHelper.accessor('outputModalities', {
    header: 'Output Modalities',
    cell: (info) => {
      const value = info.getValue<Array<string>>()
      return <span className="text-xs">{value.join(', ')}</span>
    },
    enableSorting: false,
    size: 150,
  }) as ColumnDef<FlattenedModel>,

  // 11. Input Cost
  columnHelper.accessor('inputCost', {
    header: 'Input Cost',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 12. Output Cost
  columnHelper.accessor('outputCost', {
    header: 'Output Cost',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 13. Reasoning Cost
  columnHelper.accessor('reasoningCost', {
    header: 'Reasoning Cost',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 120,
  }) as ColumnDef<FlattenedModel>,

  // 14. Cache Read Cost
  columnHelper.accessor('cacheReadCost', {
    header: 'Cache Read',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 15. Cache Write Cost
  columnHelper.accessor('cacheWriteCost', {
    header: 'Cache Write',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 16. Audio Input Cost
  columnHelper.accessor('audioInputCost', {
    header: 'Audio Input',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 17. Audio Output Cost
  columnHelper.accessor('audioOutputCost', {
    header: 'Audio Output',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 18. Context Limit
  columnHelper.accessor('contextLimit', {
    header: 'Context',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 19. Input Limit
  columnHelper.accessor('inputLimit', {
    header: 'Input Limit',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 20. Output Limit
  columnHelper.accessor('outputLimit', {
    header: 'Output Limit',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 21. Structured Output
  columnHelper.accessor('structuredOutput', {
    header: 'Structured Output',
    cell: (info) => <BooleanCell value={info.getValue()} />,
    enableSorting: true,
    size: 120,
  }) as ColumnDef<FlattenedModel>,

  // 22. Temperature
  columnHelper.accessor('temperature', {
    header: 'Temperature',
    cell: (info) => <BooleanCell value={info.getValue()} />,
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 23. Weights (Open/Closed badge)
  columnHelper.accessor('weights', {
    header: 'Weights',
    cell: (info) => {
      const value = info.getValue<string>()
      const isOpen = value.toLowerCase() === 'open'
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      )
    },
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 24. Knowledge
  columnHelper.accessor('knowledge', {
    header: 'Knowledge',
    cell: (info) => info.getValue() ?? '-',
    enableSorting: true,
    size: 150,
  }) as ColumnDef<FlattenedModel>,

  // 25. Selected (internal use - not displayed in UI but needed for selection)
  columnHelper.accessor('selected', {
    header: '',
    cell: () => null,
    enableSorting: false,
    size: 0,
  }) as ColumnDef<FlattenedModel>,

  // 26. Release Date
  columnHelper.accessor('releaseDate', {
    header: 'Released',
    cell: (info) => formatDate(info.getValue()),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,

  // 27. Last Updated
  columnHelper.accessor('lastUpdated', {
    header: 'Updated',
    cell: (info) => formatDate(info.getValue()),
    enableSorting: true,
    size: 100,
  }) as ColumnDef<FlattenedModel>,
]

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

  // Initialize column visibility from URL or localStorage
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(() => {
      // Priority 1: URL parameter (highest priority)
      if (search.cols) {
        const params = new URLSearchParams()
        params.set('cols', search.cols)
        return getColumnVisibilityFromUrl(params)
      }

      // Priority 2: localStorage (second priority)
      const saved = loadDefaultColumnVisibility()
      if (saved) {
        return saved
      }

      // Priority 3: Hard-coded defaults (fallback)
      const params = new URLSearchParams()
      return getColumnVisibilityFromUrl(params)
    })

  // Query with pagination
  const modelsQuery = useQuery({
    queryKey: ['models', pagination, globalFilter],
    queryFn: () =>
      getModels({
        data: {
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize,
          search: globalFilter,
        },
      }),
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
  }, [pagination, navigate])

  // Update URL when search changes
  useEffect(() => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: globalFilter || undefined,
      }),
    })
  }, [globalFilter, navigate])

  // Sync column visibility to URL and localStorage
  useEffect(() => {
    const visibleCols = Object.entries(columnVisibility)
      .filter(([, isVisible]) => isVisible)
      .map(([colId]) => colId)
      .join(',')

    navigate({
      search: (prev) => ({
        ...prev,
        cols: visibleCols || undefined,
      }),
    })

    // Save to localStorage for persistence
    saveDefaultColumnVisibility(columnVisibility)
  }, [columnVisibility, navigate])

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
