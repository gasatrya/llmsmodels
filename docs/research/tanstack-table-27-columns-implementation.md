# Research: TanStack Table v8.21.3 - 27 Column Table Implementation

**Date:** 2025-12-29
**Version Verified:** TanStack Table v8.21.3, React 19.2.3, Tailwind CSS v4

## 1. Executive Summary

This research provides implementation patterns for a 27-column table using TanStack Table v8.21.3 with sorting, row selection, and support for multiple data types (strings, booleans, numbers, optional numbers, and arrays). Key findings include using `createColumnHelper` for type-safe column definitions, `getSortedRowModel()` for client-side sorting, checkbox-based row selection with `enableRowSelection`, and flexible cell rendering for different data types.

## 2. Implementation Details

### 2.1 Installation & Imports

```typescript
// Install TanStack Table v8.21.3
npm install @tanstack/react-table@8.21.3

// Import required functions
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { type RowSelectionState } from '@tanstack/table-core'
```

### 2.2 Column Definition Patterns

#### Using `createColumnHelper` for Type Safety

**Best Practice:** Always use `createColumnHelper<TData>()` for type-safe column definitions.

```typescript
// Define your data interface
interface FlattenedModel {
  id: string
  name: string
  paramCount: number
  contextLength: number | null
  hasLicense: boolean
  modalities: Array<string>
  // ... 21 more fields
}

// Create typed column helper
const columnHelper = createColumnHelper<FlattenedModel>()
```

#### Column Definition Patterns for Different Data Types

```typescript
const columns: ColumnDef<FlattenedModel>[] = [
  // 1. STRING COLUMNS - Basic accessorKey
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
    enableSorting: true,
  }),

  // 2. NUMBER COLUMNS - With formatting
  columnHelper.accessor('paramCount', {
    header: 'Parameters',
    cell: (info) => {
      const value = info.getValue<number>()
      return <span className="font-mono">{value.toLocaleString()}</span>
    },
    enableSorting: true,
  }),

  // 3. OPTIONAL NUMBER COLUMNS - Handle null/undefined
  columnHelper.accessor('contextLength', {
    header: 'Context Length',
    cell: (info) => {
      const value = info.getValue<number | null>()
      return value === null ? '-' : value.toLocaleString()
    },
    enableSorting: true,
  }),

  // 4. BOOLEAN COLUMNS - Custom rendering with icons
  columnHelper.accessor('hasLicense', {
    header: 'Licensed',
    cell: (info) => {
      const value = info.getValue<boolean>()
      return (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? '✓' : '✗'}
        </span>
      )
    },
    enableSorting: true,
  }),

  // 5. ARRAY COLUMNS - Display as comma-separated list
  columnHelper.accessor('modalities', {
    header: 'Modalities',
    cell: (info) => {
      const value = info.getValue<Array<string>>()
      return (
        <span className="text-xs">
          {value.length > 0 ? value.join(', ') : '-'}
        </span>
      )
    },
    enableSorting: false, // Arrays don't sort meaningfully
  }),

  // 6. COMPUTED COLUMNS - Using accessor function
  columnHelper.accessor((row) => `${row.name} (${row.id})`, {
    id: 'displayName',
    header: 'Display Name',
    cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    enableSorting: true,
  }),

  // 7. CHECKBOX COLUMN - Row selection (display column)
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false, // Checkbox column cannot be sorted
    enableHiding: false,
  }),
]
```

### 2.3 Best Practices for Organizing 27+ Column Definitions

**Pattern 1: Group Related Columns**

```typescript
// Group 1: Identification
const idColumns = [
  columnHelper.accessor('id', { header: 'ID', size: 100 }),
  columnHelper.accessor('name', { header: 'Name', size: 200 }),
  columnHelper.accessor('displayName', { header: 'Display Name', size: 250 }),
]

// Group 2: Metrics
const metricColumns = [
  columnHelper.accessor('paramCount', { header: 'Parameters', size: 120 }),
  columnHelper.accessor('contextLength', {
    header: 'Context Length',
    size: 120,
  }),
  columnHelper.accessor('maxTokens', { header: 'Max Tokens', size: 120 }),
]

// Group 3: Flags
const flagColumns = [
  columnHelper.accessor('hasLicense', { header: 'Licensed', size: 100 }),
  columnHelper.accessor('isCommercial', { header: 'Commercial', size: 120 }),
  columnHelper.accessor('isOpenSource', { header: 'Open Source', size: 120 }),
]

// Combine all columns
const allColumns = [
  ...idColumns,
  ...metricColumns,
  ...flagColumns,
  // ... more groups
]
```

**Pattern 2: Use Column Configuration Function**

```typescript
// Reusable column factory
const createStringColumn = (key: keyof FlattenedModel, header: string) =>
  columnHelper.accessor(key as string, {
    header,
    cell: (info) => info.getValue() ?? '-',
    enableSorting: true,
    size: 150,
  })

const createNumberColumn = (key: keyof FlattenedModel, header: string) =>
  columnHelper.accessor(key as string, {
    header,
    cell: (info) => {
      const value = info.getValue<number | null>()
      return value === null ? '-' : value.toLocaleString()
    },
    enableSorting: true,
    size: 120,
  })

const createBooleanColumn = (key: keyof FlattenedModel, header: string) =>
  columnHelper.accessor(key as string, {
    header,
    cell: (info) => {
      const value = info.getValue<boolean>()
      return (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    enableSorting: true,
    size: 100,
  })

// Generate all columns
const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => <Checkbox checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
    enableSorting: false,
    size: 50,
  }),
  createStringColumn('id', 'ID'),
  createStringColumn('name', 'Name'),
  createNumberColumn('paramCount', 'Parameters'),
  createBooleanColumn('hasLicense', 'Licensed'),
  // ... more columns
]
```

### 2.4 Sorting Implementation

#### Enable Sorting with `getSortedRowModel()`

```typescript
import { useReactTable, getCoreRowModel, getSortedRowModel, type SortingState } from '@tanstack/react-table'

export function ModelsTable({ data }: { data: FlattenedModel[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    // CORE ROW MODEL - Required for basic table functionality
    getCoreRowModel: getCoreRowModel(),
    // SORTED ROW MODEL - Enables client-side sorting
    getSortedRowModel: getSortedRowModel(),
    // Manage sorting state
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    // Optional: Configure sorting globally
    enableSorting: true,
    enableMultiSort: false, // Only one column sorted at a time
    enableSortingRemoval: true, // Allow removing sort by clicking again
  })

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {/* Sort indicator */}
                {header.column.getIsSorted() === 'asc' && <span> ↑</span>}
                {header.column.getIsSorted() === 'desc' && <span> ↓</span>}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-2">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

#### Disable Sorting for Specific Columns

```typescript
// Column-level disable sorting
const columns = [
  // Checkbox column - no sorting
  columnHelper.display({
    id: 'select',
    header: ({ table }) => <Checkbox checked={table.getIsAllRowsSelected()} onChange={table.getToggleAllRowsSelectedHandler()} />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />,
    enableSorting: false, // Disable sorting for checkbox column
  }),
  // Array column - no sorting
  columnHelper.accessor('modalities', {
    header: 'Modalities',
    cell: (info) => info.getValue<Array<string>>().join(', '),
    enableSorting: false, // Arrays don't sort meaningfully
  }),
]
```

### 2.5 Row Selection Implementation

#### Enable Row Selection with Checkboxes

```typescript
import { useReactTable, getCoreRowModel, type RowSelectionState } from '@tanstack/react-table'

export function ModelsTable({ data }: { data: FlattenedModel[] }) {
  // Manage row selection state
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    // CORE ROW MODEL - Required for row selection
    getCoreRowModel: getCoreRowModel(),
    // Enable row selection
    enableRowSelection: true, // Enable row selection for all rows
    // enableRowSelection: (row) => row.original.paramCount > 1000, // Conditional selection
    // Manage row selection state
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    // Optional: Unique row ID (defaults to index)
    getRowId: (row, index) => row.id, // Use model ID instead of index
  })

  // Access selected rows
  const selectedRows = table.getSelectedRowModel().rows
  const selectedRowIds = Object.keys(rowSelection)

  return (
    <div>
      {/* Display selection count */}
      <div className="mb-4">
        {selectedRowIds.length} rows selected
      </div>

      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b ${row.getIsSelected() ? 'bg-blue-50' : ''}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

#### Row Selection Configuration Options

```typescript
const table = useReactTable({
  // ... other options

  // Option 1: Enable all rows
  enableRowSelection: true,

  // Option 2: Enable conditionally (e.g., only models with licenses)
  enableRowSelection: (row) => row.original.hasLicense,

  // Option 3: Single row selection (radio button behavior)
  enableMultiRowSelection: false,

  // Option 4: Disable sub-row selection (for grouped tables)
  enableSubRowSelection: false,
})
```

### 2.6 Boolean and Array Rendering

#### Boolean Rendering Patterns

```typescript
// Pattern 1: Icon-based rendering
columnHelper.accessor('hasLicense', {
  header: 'Licensed',
  cell: (info) => {
    const value = info.getValue<boolean>()
    return value ? <span className="text-green-600">✓</span> : <span className="text-gray-400">✗</span>
  },
})

// Pattern 2: Text-based rendering
columnHelper.accessor('isCommercial', {
  header: 'Commercial',
  cell: (info) => {
    const value = info.getValue<boolean>()
    return (
      <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
        {value ? 'Yes' : 'No'}
      </span>
    )
  },
})

// Pattern 3: Badge rendering with colors
columnHelper.accessor('isOpenSource', {
  header: 'Open Source',
  cell: (info) => {
    const value = info.getValue<boolean>()
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {value && <span className="w-2 h-2 mr-1 bg-green-500 rounded-full" />}
        {value ? 'Open Source' : 'Proprietary'}
      </span>
    )
  },
})
```

#### Array Rendering Patterns

```typescript
// Pattern 1: Comma-separated string
columnHelper.accessor('modalities', {
  header: 'Modalities',
  cell: (info) => {
    const value = info.getValue<Array<string>>()
    return <span className="text-sm">{value.join(', ')}</span>
  },
})

// Pattern 2: Tag list
columnHelper.accessor('modalities', {
  header: 'Modalities',
  cell: (info) => {
    const value = info.getValue<Array<string>>()
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((modality) => (
          <span key={modality} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
            {modality}
          </span>
        ))}
      </div>
    )
  },
})

// Pattern 3: Count with tooltip
columnHelper.accessor('modalities', {
  header: 'Modalities',
  cell: (info) => {
    const value = info.getValue<Array<string>>()
    const count = value.length
    return (
      <span className="text-sm" title={value.join(', ')}>
        {count} modality{count !== 1 ? 'ies' : ''}
      </span>
    )
  },
})

// Pattern 4: Truncated list with "and more"
columnHelper.accessor('modalities', {
  header: 'Modalities',
  cell: (info) => {
    const value = info.getValue<Array<string>>()
    const maxDisplay = 3
    const display = value.slice(0, maxDisplay)
    const remaining = value.length - maxDisplay

    return (
      <span className="text-sm">
        {display.join(', ')}
        {remaining > 0 && <span className="text-gray-500"> +{remaining} more</span>}
      </span>
    )
  },
})
```

### 2.7 Table CSS Patterns (Tailwind CSS v4)

#### Basic Table Structure

```html
<!-- Table Container with Scroll -->
<div class="overflow-x-auto rounded-lg border border-gray-200">
  <table class="min-w-full divide-y divide-gray-200">
    <!-- Header -->
    <thead class="bg-gray-50">
      <tr>
        <th
          class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
        >
          Column Name
        </th>
      </tr>
    </thead>
    <!-- Body -->
    <tbody class="bg-white divide-y divide-gray-200">
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-3 text-sm text-gray-900">Cell Content</td>
      </tr>
    </tbody>
  </table>
</div>
```

#### Tailwind CSS Class Reference

| Element             | Classes                                                                          | Description                                |
| ------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| **Table Container** | `overflow-x-auto rounded-lg border border-gray-200`                              | Horizontal scroll, rounded corners, border |
| **Table**           | `min-w-full divide-y divide-gray-200`                                            | Full width, horizontal dividers            |
| **Thead**           | `bg-gray-50`                                                                     | Light gray background for header           |
| **Th**              | `px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider` | Header cell styling                        |
| **Tbody**           | `bg-white divide-y divide-gray-200`                                              | White background, row dividers             |
| **Tr**              | `hover:bg-gray-50`                                                               | Hover effect on rows                       |
| **Td**              | `px-4 py-3 text-sm text-gray-900`                                                | Default cell styling                       |

#### Variations

```html
<!-- Compact Table (Dense) -->
<table class="min-w-full divide-y divide-gray-200 text-xs">
  <thead>
    <tr>
      <th class="px-3 py-2 text-left font-medium text-gray-500 uppercase">
        Header
      </th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
    <tr>
      <td class="px-3 py-2">Cell</td>
    </tr>
  </tbody>
</table>

<!-- Striped Table -->
<table class="min-w-full divide-y divide-gray-200">
  <tbody class="bg-white divide-y divide-gray-200">
    <tr class="bg-white">
      <td class="px-4 py-3">Row 1</td>
    </tr>
    <tr class="bg-gray-50">
      <td class="px-4 py-3">Row 2</td>
    </tr>
    <tr class="bg-white">
      <td class="px-4 py-3">Row 3</td>
    </tr>
  </tbody>
</table>

<!-- Table with Selected Row Highlight -->
<tr class="bg-blue-50">
  <td class="px-4 py-3 text-blue-900 font-medium">Selected Row</td>
</tr>
```

## 3. Complete Working Example

```typescript
'use client'

import React from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'

// Define data interface
interface FlattenedModel {
  id: string
  name: string
  displayName: string
  paramCount: number
  contextLength: number | null
  maxTokens: number
  hasLicense: boolean
  isCommercial: boolean
  isOpenSource: boolean
  modalities: Array<string>
  languages: Array<string>
  // ... 17 more fields
}

// Create column helper
const columnHelper = createColumnHelper<FlattenedModel>()

// Checkbox component (simplified)
const Checkbox = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
  />
)

// Define columns
const columns: ColumnDef<FlattenedModel>[] = [
  // Checkbox column
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
    size: 50,
  }),

  // String columns
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    size: 100,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
    size: 200,
  }),
  columnHelper.accessor('displayName', {
    header: 'Display Name',
    cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    size: 250,
  }),

  // Number columns
  columnHelper.accessor('paramCount', {
    header: 'Parameters',
    cell: (info) => {
      const value = info.getValue<number>()
      return <span className="font-mono">{value.toLocaleString()}</span>
    },
    size: 120,
  }),
  columnHelper.accessor('contextLength', {
    header: 'Context Length',
    cell: (info) => {
      const value = info.getValue<number | null>()
      return value === null ? '-' : <span className="font-mono">{value.toLocaleString()}</span>
    },
    size: 120,
  }),
  columnHelper.accessor('maxTokens', {
    header: 'Max Tokens',
    cell: (info) => {
      const value = info.getValue<number>()
      return <span className="font-mono">{value.toLocaleString()}</span>
    },
    size: 120,
  }),

  // Boolean columns
  columnHelper.accessor('hasLicense', {
    header: 'Licensed',
    cell: (info) => {
      const value = info.getValue<boolean>()
      return <span className={value ? 'text-green-600' : 'text-gray-400'}>{value ? '✓' : '✗'}</span>
    },
    size: 100,
  }),
  columnHelper.accessor('isCommercial', {
    header: 'Commercial',
    cell: (info) => {
      const value = info.getValue<boolean>()
      return (
        <span className={`px-2 py-1 rounded text-xs ${value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    size: 100,
  }),
  columnHelper.accessor('isOpenSource', {
    header: 'Open Source',
    cell: (info) => {
      const value = info.getValue<boolean>()
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value && <span className="w-2 h-2 mr-1 bg-green-500 rounded-full" />}
          {value ? 'Open' : 'Proprietary'}
        </span>
      )
    },
    size: 120,
  }),

  // Array columns
  columnHelper.accessor('modalities', {
    header: 'Modalities',
    cell: (info) => {
      const value = info.getValue<Array<string>>()
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((modality) => (
            <span key={modality} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              {modality}
            </span>
          ))}
        </div>
      )
    },
    enableSorting: false,
    size: 200,
  }),
  columnHelper.accessor('languages', {
    header: 'Languages',
    cell: (info) => {
      const value = info.getValue<Array<string>>()
      const maxDisplay = 2
      const display = value.slice(0, maxDisplay)
      const remaining = value.length - maxDisplay

      return (
        <span className="text-sm">
          {display.join(', ')}
          {remaining > 0 && <span className="text-gray-500"> +{remaining} more</span>}
        </span>
      )
    },
    size: 200,
  }),

  // ... 15 more column definitions
]

// Main table component
export function ModelsTable({ data }: { data: FlattenedModel[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
    getRowId: (row) => row.id,
  })

  const selectedRows = table.getSelectedRowModel().rows

  return (
    <div className="space-y-4">
      {/* Selection info */}
      {selectedRows.length > 0 && (
        <div className="px-4 py-3 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between">
          <span className="font-medium">{selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => setRowSelection({})}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={{ width: header.getSize() }}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center space-x-1 hover:text-gray-700 focus:outline-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <span>↑</span>}
                        {header.column.getIsSorted() === 'desc' && <span>↓</span>}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50 ${row.getIsSelected() ? 'bg-blue-50' : ''}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

## 4. Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-table": "8.21.3",
    "react": "^19.2.3"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

## 5. Verified Sources

1. **TanStack Table v8 Documentation - Row Selection**: https://tanstack.com/table/v8/docs/guide/row-selection
2. **TanStack Table v8 Documentation - Column Definitions**: https://tanstack.com/table/v8/docs/guide/column-defs
3. **TanStack Table v8 Documentation - Sorting**: https://tanstack.com/table/v8/docs/guide/sorting
4. **TanStack Table v8 Examples - Row Selection**: https://github.com/TanStack/table/tree/main/examples/react/row-selection
5. **TanStack Table v8 Examples - Sorting**: https://github.com/TanStack/table/tree/main/examples/react/sorting
6. **Tailwind CSS Table Layout Documentation**: https://v3.tailwindcss.com/docs/table-layout
7. **Tailwind CSS Table Components (Flowbite)**: https://flowbite.com/docs/components/tables/
8. **GitHub Real-World Examples**:
   - Calcom/cal.com - Insights columns
   - Shadcn UI - Data table implementation
   - Supabase - UI table components
