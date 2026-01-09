import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
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
import { modelsQueryOptions } from '@/lib/models'
import { modelColumns } from '@/lib/model-columns'
import { ModelList } from '@/components/ModelList'
import { SearchBar } from '@/components/SearchBar'
import { SimplifiedFilters } from '@/components/SimplifiedFilters'
import { ColumnVisibilityToggle } from '@/components/ColumnVisibilityToggle'
import { SEOContent } from '@/components/SEOContent'

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
  head: () => ({
    meta: [
      {
        title: 'LLMsModels - Discover & Compare State-of-the-Art AI Models',
      },
      {
        name: 'description',
        content:
          'The most comprehensive database to compare open-weights and proprietary LLMs. Filter by reasoning capabilities, tool use, and more.',
      },
      {
        name: 'keywords',
        content:
          'AI models, LLM, compare LLMs, open-weights models, AI database',
      },
    ],
  }),
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
    defaultColumn: {
      minSize: 50, // Ensure columns don't shrink below this width
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: fuzzyFilter,
    getRowId: (row) => `${row.providerId}-${row.modelId}`,
  })

  const totalCount = filteredData.length

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col font-sans text-black">
      <header className="mb-8 flex-none pt-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4 text-black drop-shadow-[4px_4px_0px_rgba(255,230,0,1)]">
          Discover State-of-the-Art{' '}
          <span className="bg-black text-white px-2">AI Models</span>
        </h1>
        <p className="text-xl text-black font-bold max-w-2xl leading-relaxed border-l-8 border-black pl-4">
          The most comprehensive database to compare{' '}
          {totalCount.toLocaleString()} open-weights and proprietary LLMs.
          Filter by reasoning capabilities, tool use, and more.
        </p>
      </header>

      <div className="space-y-6 flex-none">
        {/* Search Bar and Column Visibility */}
        <div className="flex flex-col md:flex-row gap-4 items-start flex-none">
          <SearchBar
            value={globalFilter}
            onChange={setGlobalFilter}
            className="w-full md:max-w-md flex-1"
          />
          <ColumnVisibilityToggle
            table={table}
            onVisibilityChange={setColumnVisibility}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex-none mb-16">
          <SimplifiedFilters
            filters={filters}
            onChange={setFilters}
            className="mt-2"
          />
        </div>

        {/* Table Area - fixed height for scrolling */}
        {table.getRowModel().rows.length === 0 ? (
          <div className="flex items-center justify-center py-20 border-4 border-dashed border-black bg-gray-50">
            <div className="text-black font-bold text-lg uppercase">
              No models found matching your criteria
            </div>
          </div>
        ) : (
          <div className="h-[600px] relative">
            <ModelList table={table} />
          </div>
        )}
      </div>

      {/* SEO Long Description Section - Outside table wrapper */}
      <SEOContent />
    </div>
  )
}
