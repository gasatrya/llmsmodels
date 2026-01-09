import React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { FlattenedModel } from '@/types/models'

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


const CopyableId = ({ id }: { id: string }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = React.useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }, [id])

  return (
    <div
      onClick={handleCopy}
      className="group flex items-center gap-1.5 cursor-pointer max-w-full"
      title="Click to copy ID"
    >
      <span className="font-mono text-xs truncate">{id}</span>
      <span className="shrink-0 flex items-center justify-center w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {copied ? (
          <span className="text-green-600 text-[10px]">✓</span>
        ) : (
          <span className="text-[10px]">📋</span>
        )}
      </span>
    </div>
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

export const modelColumns: Array<ColumnDef<FlattenedModel>> = [
  // 1. Provider Name
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
    cell: (info) => <CopyableId id={info.getValue()} />,
    enableSorting: true,
    size: 250,
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
    header: 'Input',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 80,
  }) as ColumnDef<FlattenedModel>,

  // 12. Output Cost
  columnHelper.accessor('outputCost', {
    header: 'Output',
    cell: (info) => (
      <span className="font-mono text-xs">{formatNumber(info.getValue())}</span>
    ),
    enableSorting: true,
    size: 80,
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
    size: 80,
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
    size: 80,
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
