# Research: TanStack Table Server-Side Operations

**Date:** 2025-12-29
**Version Verified:** TanStack Table v8, TanStack Query v5

## 1. Executive Summary

**Answer: YES** - TanStack Table **fully supports** server-side pagination, search, and filtering.

TanStack Table v8 provides built-in support for server-side operations through two key configuration options:

- `manualPagination: true` - Disables client-side pagination
- `manualFiltering: true` - Disables client-side filtering

The pattern for server-side operations is:

1. **Manage state externally** (pagination, filters, global search)
2. **Sync with API via TanStack Query** - Pass state to query key/function
3. **Return pre-processed data** to TanStack Table
4. **Use `rowCount` or `pageCount`** to tell table how many total rows exist

This resolves the potential conflict in the spec: You can use TanStack Table's built-in state management (`globalFilter`, `columnFilters`, `pagination`) for UI while delegating the actual data processing to your server.

---

## 2. Implementation Details

### 2.1 Server-Side Pagination

**Key Configuration:**

```typescript
const table = useReactTable({
  data: dataQuery.data?.rows ?? [],
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true, // Disables client-side pagination
  rowCount: dataQuery.data?.rowCount, // Total rows (v8.13.0+) or pageCount directly
  state: {
    pagination, // Control pagination externally
  },
  onPaginationChange: setPagination, // Sync changes to your state
})
```

**How it works:**

- `manualPagination: true` tells TanStack Table NOT to slice the data array
- Table renders whatever rows you pass in `data`
- You must provide `rowCount` or `pageCount` so the table knows page counts for pagination controls
- Pagination state (`pageIndex`, `pageSize`) is controlled externally via `state.pagination`
- When pagination changes, `onPaginationChange` fires, updating your external state
- External state triggers TanStack Query to fetch new data with updated pagination params

**API Options:**

- `manualPagination?: boolean` - Enable manual (server-side) pagination
- `rowCount?: number` - Total row count from server (v8.13.0+)
- `pageCount?: number` - Alternative to rowCount (calculated if rowCount provided)
- `onPaginationChange?: OnChangeFn<PaginationState>` - Callback for pagination changes
- `state.pagination` - Control pagination externally

---

### 2.2 Server-Side Filtering

**Key Configuration:**

```typescript
const table = useReactTable({
  data: dataQuery.data?.rows ?? [],
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualFiltering: true, // Disables client-side filtering
  // getFilteredRowModel() - NOT needed for server-side
  state: {
    columnFilters, // Control filters externally
    globalFilter,
  },
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
})
```

**How it works:**

- `manualFiltering: true` tells TanStack Table NOT to filter the data array
- Table uses the `globalFilter` and `columnFilters` state for UI purposes (showing active filters)
- Actual filtering happens on the server based on the filter values
- You pass the pre-filtered data from the API to the table's `data` prop
- When filters change, `onColumnFiltersChange` / `onGlobalFilterChange` fire
- External state triggers TanStack Query to fetch new data with updated filter params

**API Options:**

- `manualFiltering?: boolean` - Enable manual (server-side) filtering
- `onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>` - Callback for column filter changes
- `onGlobalFilterChange?: OnChangeFn<GlobalFilterState>` - Callback for global filter changes
- `state.columnFilters` - Control column filters externally
- `state.globalFilter` - Control global search externally

**Column Filter State Structure:**

```typescript
interface ColumnFilter {
  id: string // Column ID (e.g., 'status', 'organization')
  value: unknown // Filter value (e.g., 'active', 'OpenAI')
}

type ColumnFiltersState = ColumnFilter[]
```

---

### 2.3 Complete Example with TanStack Query

This is the official pattern from TanStack Table documentation for full server-side integration:

```typescript
import React from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type GlobalFilterState,
} from '@tanstack/react-table'

// 1. Define external state (controlled by table, but owned by you)
const [pagination, setPagination] = React.useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})

const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
const [globalFilter, setGlobalFilter] = React.useState<GlobalFilterState>('')

// 2. Use TanStack Query to fetch data with current state
const dataQuery = useQuery({
  queryKey: ['models', { pagination, columnFilters, globalFilter }],
  queryFn: () =>
    fetchModels({
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
      filters: columnFilters,
      search: globalFilter,
    }),
  placeholderData: keepPreviousData, // Keeps previous data while loading
})

// 3. Configure TanStack Table with manual modes
const table = useReactTable({
  data: dataQuery.data?.rows ?? [],
  columns,
  getCoreRowModel: getCoreRowModel(),

  // Server-side pagination
  manualPagination: true,
  rowCount: dataQuery.data?.rowCount,
  state: { pagination },
  onPaginationChange: setPagination,

  // Server-side filtering
  manualFiltering: true,
  state: { columnFilters, globalFilter },
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
})

// 4. Render table UI
// ... (use table.getHeaderGroups(), table.getRowModel(), etc.)
```

**API Function Example:**

```typescript
async function fetchModels({ page, pageSize, filters, search }: FetchParams) {
  const params = new URLSearchParams({
    page: String(page + 1), // API might use 1-based indexing
    limit: String(pageSize),
  })

  // Add column filters
  filters.forEach((filter) => {
    params.append(`filter[${filter.id}]`, String(filter.value))
  })

  // Add global search
  if (search) {
    params.set('search', search)
  }

  const response = await fetch(`/api/models?${params}`)
  return response.json() // { rows: Model[], rowCount: number }
}
```

---

### 2.4 State Management Flow

```
User Action (click next page, type in search, select filter)
    ↓
TanStack Table state changes (pagination, globalFilter, columnFilters)
    ↓
onXChange callbacks fire (onPaginationChange, onGlobalFilterChange, etc.)
    ↓
External state updated (React useState or router state)
    ↓
TanStack Query detects queryKey change
    ↓
Query function called with new parameters
    ↓
API request made to server
    ↓
Server returns filtered/paginated data + total count
    ↓
Query caches response, dataQuery.data updates
    ↓
Table receives new rows via data prop
    ↓
Table re-renders with new data
```

---

## 3. Key Findings for This Project

### 3.1 Resolving the Spec Conflict

**Spec says:** "Use TanStack Table's built-in globalFilter and columnFilters instead of custom filtering logic"

**Our server API:** Has server-side pagination, search, and filtering

**Resolution:** This is NOT a conflict. Here's why:

1. **TanStack Table handles UI state** - The table manages filter values, shows filter inputs, and tracks active filters
2. **Server handles data processing** - The actual filtering/pagination happens on the server
3. **TanStack Query handles synchronization** - React Query syncs table state to API requests

The spec is correct: You SHOULD use TanStack Table's `globalFilter` and `columnFilters` for the UI layer. You just need to set `manualFiltering: true` and `manualPagination: true` to delegate the actual work to your server.

### 3.2 Recommended Architecture

```typescript
// Use a custom hook to encapsulate the pattern
function useModelsTable() {
  // State managed by TanStack Table, controlled by us
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterState>('')

  // Query that syncs with table state
  const query = useQuery({
    queryKey: ['models', pagination, columnFilters, globalFilter],
    queryFn: () =>
      fetchModelsApi({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        filters: columnFilters,
        search: globalFilter,
      }),
    placeholderData: keepPreviousData,
  })

  // Table configured for server-side
  const table = useReactTable({
    data: query.data?.rows ?? [],
    columns: modelsColumns, // Your column definitions
    getCoreRowModel: getCoreRowModel(),

    // Server-side mode
    manualPagination: true,
    manualFiltering: true,
    rowCount: query.data?.rowCount,

    // External state control
    state: { pagination, columnFilters, globalFilter },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  return { table, query }
}
```

### 3.3 Server API Requirements

Your Phase 3.5 server API is already set up correctly if it accepts:

- `page` or `pageIndex` (0-based or 1-based, adjust accordingly)
- `limit` or `pageSize`
- Filter parameters (can be query params like `?filter[status]=active`)
- Search parameter (`?search=gpt`)

And returns:

```typescript
{
  rows: Model[],      // Current page of data (already filtered/sorted)
  rowCount: number,   // Total count across all pages
  // Optional: pageCount, nextPage, etc.
}
```

---

## 4. Best Practices

### 4.1 Loading States

Use `keepPreviousData` from TanStack Query:

```typescript
const dataQuery = useQuery({
  queryKey: ['data', pagination, filters],
  queryFn: fetchData,
  placeholderData: keepPreviousData, // Shows previous data while loading
})

// Show loading indicator
{dataQuery.isFetching && <div>Loading...</div>}
```

### 4.2 Error Handling

```typescript
const dataQuery = useQuery({
  queryKey: ['data', pagination, filters],
  queryFn: fetchData,
  retry: 2,
})

if (dataQuery.error) {
  return <div>Error: {dataQuery.error.message}</div>
}
```

### 4.3 Debouncing Filters

For search/filter inputs that trigger many changes, debounce:

```typescript
import { useDebouncedValue } from '@/hooks/useDebounce'

const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebouncedValue(searchTerm, 300)

// Only query with debounced value
const dataQuery = useQuery({
  queryKey: ['data', pagination, debouncedSearch],
  queryFn: () => fetchData({ search: debouncedSearch }),
})
```

### 4.4 URL State Sync (Optional)

For shareable URLs, sync with router:

```typescript
// Using TanStack Router or similar
const [searchParams] = useSearch({
  page: 0,
  pageSize: 20,
  filters: [] as ColumnFiltersState,
  search: '',
})

// On state change, update URL
onPaginationChange: (updater) => {
  const newPagination = functionalUpdate(updater, pagination)
  navigate({ search: { ...searchParams, ...newPagination } })
}
```

---

## 5. Column Filter Integration

### 5.1 Using TanStack Table's Built-in Filter UI

TanStack Table provides `column.getFilterValue()` and `column.setFilterValue()` for connecting filter inputs:

```typescript
// In your filter component
function Filter({ column }: { column: Column<any, any> }) {
  const filterValue = column.getFilterValue()

  return (
    <input
      value={(filterValue ?? '') as string}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder="Search..."
    />
  )
}
```

### 5.2 Custom Filter Components

For complex filters (dropdowns, multi-select), you can still use TanStack Table's state:

```typescript
// Column definition
{
  accessorKey: 'organization',
  header: 'Organization',
  cell: info => info.getValue(),
  meta: {
    filterComponent: OrganizationFilter,  // Custom filter UI
  }
}

// In your table header
{column.columnDef.meta?.filterComponent && (
  <column.columnDef.meta.filterComponent column={column} />
)}
```

---

## 6. Working Example from Official Docs

This is the complete example from TanStack Table's "Pagination Controlled" example, adapted for our context:

```typescript
import React from 'react'
import {
  keepPreviousData,
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table'

type Model = {
  id: string
  name: string
  organization: string
  contextLength: number
  pricing: string
}

const columns: ColumnDef<Model>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
  },
  {
    accessorKey: 'contextLength',
    header: 'Context Length',
  },
  {
    accessorKey: 'pricing',
    header: 'Pricing',
  },
]

// Mock API function
async function fetchModels({
  page,
  pageSize,
  filters,
  search,
}: {
  page: number
  pageSize: number
  filters: ColumnFiltersState
  search: string
}) {
  // In real app: return fetch(`/api/models?...`).then(r => r.json())
  return {
    rows: [], // Your actual data
    rowCount: 0, // Total count from server
  }
}

function ModelsTable() {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const dataQuery = useQuery({
    queryKey: ['models', pagination, columnFilters, globalFilter],
    queryFn: () => fetchModels({ ...pagination, filters: columnFilters, search: globalFilter }),
    placeholderData: keepPreviousData,
  })

  const table = useReactTable({
    data: dataQuery.data?.rows ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,
    manualFiltering: true,
    rowCount: dataQuery.data?.rowCount,

    state: {
      pagination,
      columnFilters,
      globalFilter,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      {/* Search Input */}
      <input
        value={globalFilter ?? ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search models..."
        className="mb-4 p-2 border"
      />

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="border p-2 text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())
                  }
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="border p-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-2 border disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-2 border disabled:opacity-50"
        >
          Next
        </button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="p-2 border"
        >
          {[10, 20, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {dataQuery.isFetching && <div className="mt-2">Loading...</div>}

      {/* Row Count Display */}
      <div className="mt-2">
        Showing {table.getRowModel().rows.length} of {dataQuery.data?.rowCount ?? 0} models
      </div>
    </div>
  )
}

// Wrap with QueryClientProvider in your app
export function App() {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ModelsTable />
    </QueryClientProvider>
  )
}
```

---

## 7. Recommendation

**YES, use TanStack Table's built-in state management** for the UI layer with server-side operations.

### Recommended Approach for This Project:

1. **Keep Phase 3.5 server API** - It's correctly designed for server-side operations
2. **Use TanStack Table's `globalFilter` and `columnFilters`** for managing filter UI state
3. **Set `manualFiltering: true` and `manualPagination: true`** to delegate data processing to server
4. **Use TanStack Query to sync state** - React Query will fetch new data when filters/pagination change
5. **Return `rowCount` or `pageCount`** from API so table knows pagination bounds

### Architecture Pattern:

```
┌─────────────────────────────────────────────────┐
│           TanStack Table UI Layer               │
│  - Pagination controls                         │
│  - Filter inputs (global & column)             │
│  - State: pagination, globalFilter, columnFilters │
└─────────────────────┬───────────────────────────┘
                      │ onXChange callbacks
                      ▼
┌─────────────────────────────────────────────────┐
│          React State (useState)                │
│  - Owned by component, controlled by table     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         TanStack Query (useQuery)              │
│  - queryKey: ['models', pagination, filters]   │
│  - Detects state changes, triggers fetch       │
└─────────────────────┬───────────────────────────┘
                      │ API Request
                      ▼
┌─────────────────────────────────────────────────┐
│        Phase 3.5 Server API                   │
│  - Accepts: page, pageSize, filters, search  │
│  - Returns: { rows: Model[], rowCount: n }    │
└─────────────────────────────────────────────────┘
```

This pattern fully resolves the spec's requirement to "use TanStack Table's built-in globalFilter and columnFilters" while supporting server-side operations.

---

## 8. Verified Sources

### Official Documentation

1. **TanStack Table - Column Filtering Guide**
   - https://tanstack.com/table/v8/docs/guide/column-filtering
   - Confirms `manualFiltering: true` for server-side filtering

2. **TanStack Table - Pagination Controlled Example**
   - https://tanstack.com/table/v8/docs/framework/react/examples/pagination-controlled
   - Complete working example of server-side pagination with React Query

3. **TanStack Table API - Pagination Features**
   - https://tanstack.com/table/v8/docs/api/features/pagination
   - Documents `manualPagination`, `rowCount`, `pageCount`, `onPaginationChange`

4. **TanStack Table API - Column Filtering Features**
   - https://tanstack.com/table/v8/docs/api/features/column-filtering
   - Documents `manualFiltering`, `onColumnFiltersChange`, `onGlobalFilterChange`

5. **TanStack Query - Paginated Queries Guide**
   - https://tanstack.com/query/v5/docs/framework/react/guides/paginated-queries
   - Best practices for pagination with `keepPreviousData`

### Community Examples

6. **GitHub Discussion - Use with react-query (#2193)**
   - https://github.com/TanStack/table/discussions/2193
   - Shows integration pattern with external state control

7. **Medium - Server Side Pagination, Filtering and Sorting**
   - https://medium.com/@clee080/how-to-do-server-side-pagination-column-filtering-and-sorting-with-tanstack-react-table-and-react-7400a5604ff2
   - Practical guide with React Query integration

### Key Takeaway from Sources

All sources confirm: **TanStack Table fully supports server-side operations** through the `manualPagination` and `manualFiltering` configuration options. The pattern is well-documented and widely used in production applications.

---

## 9. Migration Checklist

If migrating from client-side to server-side:

- [ ] Add `manualPagination: true` to `useReactTable` options
- [ ] Add `manualFiltering: true` to `useReactTable` options
- [ ] Remove `getPaginationRowModel()` if present (not needed for manual)
- [ ] Remove `getFilteredRowModel()` if present (not needed for manual)
- [ ] Add `rowCount: data?.rowCount` from API response
- [ ] Extract pagination state: `const [pagination, setPagination] = useState(...)`
- [ ] Extract filter state: `const [columnFilters, setColumnFilters] = useState(...)`
- [ ] Extract global filter state: `const [globalFilter, setGlobalFilter] = useState(...)`
- [ ] Pass external state to table via `state: { pagination, columnFilters, globalFilter }`
- [ ] Pass callbacks: `onPaginationChange`, `onColumnFiltersChange`, `onGlobalFilterChange`
- [ ] Update TanStack Query queryKey to include external state
- [ ] Update API function to accept pagination/filter parameters
- [ ] Update API response to include `rowCount` or `pageCount`
- [ ] Add `placeholderData: keepPreviousData` to useQuery for smooth transitions
- [ ] Test pagination (prev/next/page size changes)
- [ ] Test filters (add/remove filters)
- [ ] Test global search
- [ ] Test error states
- [ ] Test loading states

---

**Final Output Format (Chat Response)**

After saving the file, I'll report back:

```
RESEARCH STATUS: COMPLETED
DOC SAVED: docs/research/phase5-server-side-tanstack-table.md
SUMMARY: Confirmed TanStack Table v8 fully supports server-side pagination, search, and filtering through `manualPagination: true` and `manualFiltering: true` options. The pattern uses TanStack Table for UI state management and TanStack Query to sync with server API. No conflict exists - this is the recommended approach for large datasets. Code examples and integration patterns are saved in the document.
```
