import React, { useRef } from 'react'
import { flexRender } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { Table as TableType } from '@tanstack/react-table'
import type { FlattenedModel } from '@/types/models'

interface ModelListProps {
  table: TableType<FlattenedModel>
}

export function ModelList({ table }: ModelListProps): React.ReactElement {
  const { rows } = table.getRowModel()
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53, // Approximate row height in px
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none"
    >
      <table className="min-w-full table-fixed">
        <thead className="bg-yellow-300 sticky top-0 z-10 border-b-4 border-black">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-4 text-left text-sm font-black text-black uppercase tracking-wider border-r-2 border-black last:border-r-0"
                  style={{ width: header.getSize(), minWidth: header.getSize() }}
                >
                  {header.column.getCanSort() ? (
                    <button
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center space-x-1 hover:bg-black hover:text-yellow-300 px-2 py-1 -ml-2 border-2 border-transparent hover:border-black transition-colors"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === 'asc' && <span>↑</span>}
                      {header.column.getIsSorted() === 'desc' && <span>↓</span>}
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
        <tbody className="divide-y-2 divide-black text-black bg-white">
          {paddingTop > 0 && (
            <tr>
              <td
                style={{ height: `${paddingTop}px` }}
                colSpan={table.getVisibleLeafColumns().length}
              />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index]
            return (
              <tr
                key={row.id}
                className={`hover:bg-blue-100 transition-colors border-b-2 border-black last:border-b-0 ${
                  row.getIsSelected() ? 'bg-green-200' : ''
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm whitespace-nowrap overflow-hidden text-ellipsis font-medium border-r-2 border-black last:border-r-0"
                    style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                style={{ height: `${paddingBottom}px` }}
                colSpan={table.getVisibleLeafColumns().length}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
