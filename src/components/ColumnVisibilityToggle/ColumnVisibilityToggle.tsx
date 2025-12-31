import { useState } from 'react'
import { Settings } from 'lucide-react'
import type { Table } from '@tanstack/react-table'
import type { ColumnVisibilityState } from '@/types/column-visibility'
import type { FlattenedModel } from '@/types/models'
import { ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from '@/types/column-visibility'

interface ColumnVisibilityToggleProps {
  table: Table<FlattenedModel>
  onVisibilityChange: (visibility: ColumnVisibilityState) => void
}

export function ColumnVisibilityToggle({
  table,
  onVisibilityChange,
}: ColumnVisibilityToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => setIsOpen(!isOpen)

  const closeDropdown = () => setIsOpen(false)

  const handleShowAll = () => {
    const newVisibility: ColumnVisibilityState = {}
    ALL_COLUMNS.forEach((column) => {
      newVisibility[column.id] = true
      table.getColumn(column.id)?.toggleVisibility(true)
    })
    onVisibilityChange(newVisibility)
  }

  const handleReset = () => {
    const newVisibility: ColumnVisibilityState = {}
    ALL_COLUMNS.forEach((column) => {
      const isVisible = DEFAULT_VISIBLE_COLUMNS.includes(column.id)
      newVisibility[column.id] = isVisible
      table.getColumn(column.id)?.toggleVisibility(isVisible)
    })
    onVisibilityChange(newVisibility)
  }

  const handleCheckboxChange = (columnId: string, checked: boolean) => {
    table.getColumn(columnId)?.toggleVisibility(checked)

    // Get current visibility state and update it
    const currentVisibility = table.getState().columnVisibility
    const newVisibility: ColumnVisibilityState = {
      ...currentVisibility,
      [columnId]: checked,
    }
    onVisibilityChange(newVisibility)
  }

  const isColumnVisible = (columnId: string) => {
    return table.getColumn(columnId)?.getIsVisible() ?? true
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        aria-label="Toggle column visibility"
        aria-expanded={isOpen}
      >
        <Settings className="w-4 h-4" aria-hidden="true" />
        <span>Columns</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full mt-1 z-20 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2"
            role="dialog"
            aria-label="Column visibility options"
          >
            <div className="flex items-center justify-between px-2 py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-900">
                Visible Columns
              </span>
            </div>

            <div className="flex gap-2 px-2 py-2 border-b border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleShowAll}
                className="flex-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700"
              >
                Show all
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto py-1">
              {ALL_COLUMNS.map((column) => (
                <li
                  key={column.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={isColumnVisible(column.id)}
                    onChange={(e) =>
                      handleCheckboxChange(column.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Toggle ${column.label} column visibility`}
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    {column.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
