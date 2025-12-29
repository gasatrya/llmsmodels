import React from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
import type { FlattenedModel } from '@/types/models'

interface ModelListProps {
  models: Array<FlattenedModel>
  isLoading?: boolean
  error?: unknown
}

const columnHelper = createColumnHelper<FlattenedModel>()

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '-'
  return value.toLocaleString()
}

const formatDate = (value: string | undefined): string => {
  if (!value) return '-'
  return value
}

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

export function ModelList({
  models,
  isLoading,
  error,
}: ModelListProps): React.ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable<FlattenedModel>({
    data: models,
    columns: modelColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row) => row.modelId,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    // @ts-expect-error - filterFns is required due to module augmentation in demo/table.tsx but we don't use it
    filterFns: {},
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading models...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error loading models</div>
      </div>
    )
  }

  const selectedRows = table.getSelectedRowModel().rows

  return (
    <div className="space-y-4">
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
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === 'asc' && (
                          <span>↑</span>
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <span>↓</span>
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
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
