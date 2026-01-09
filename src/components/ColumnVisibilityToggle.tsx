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
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border-2 border-black rounded-none hover:bg-yellow-200 text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        aria-label="Toggle column visibility"
        aria-expanded={isOpen}
      >
        <Settings className="w-4 h-4" aria-hidden="true" strokeWidth={2.5} />
        <span className="font-bold uppercase">Columns</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-full mt-2 z-20 w-64 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0"
            role="dialog"
            aria-label="Column visibility options"
          >
            <div className="flex items-center justify-between px-3 py-3 border-b-4 border-black bg-blue-200">
              <span className="text-sm font-black text-black uppercase">
                Visible Columns
              </span>
            </div>

            <div className="flex gap-2 px-3 py-3 border-b-4 border-black">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-2 py-1.5 text-xs bg-white border-2 border-black hover:bg-gray-200 rounded-none text-black font-bold uppercase transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleShowAll}
                className="flex-1 px-2 py-1.5 text-xs bg-black border-2 border-black hover:bg-gray-800 rounded-none text-white font-bold uppercase transition-colors"
              >
                Show all
              </button>
            </div>

            <ul className="max-h-80 overflow-y-auto py-2 px-1">
              {ALL_COLUMNS.map((column) => (
                <li
                  key={column.id}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-yellow-100 rounded-none cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={isColumnVisible(column.id)}
                    onChange={(e) =>
                      handleCheckboxChange(column.id, e.target.checked)
                    }
                    className="w-4 h-4 rounded-none border-2 border-black bg-white checked:bg-black focus:ring-0"
                    aria-label={`Toggle ${column.label} column visibility`}
                  />
                  <label
                    htmlFor={`column-${column.id}`}
                    className="text-sm text-black cursor-pointer flex-1 font-bold"
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
