import type { SimpleFiltersState } from '@/types/filters'

interface SimplifiedFiltersProps {
  filters: SimpleFiltersState
  onChange: (filters: SimpleFiltersState) => void
  className?: string
}

export function SimplifiedFilters({
  filters,
  onChange,
  className,
}: SimplifiedFiltersProps) {
  const handleFilterChange = (key: keyof SimpleFiltersState) => {
    return () => {
      if (!(key in filters)) {
        return
      }

      const newFilters = {
        ...filters,
        [key]: filters[key] === true ? undefined : true,
      }
      onChange(newFilters)
    }
  }

  return (
    <fieldset
      className={`flex flex-wrap items-center gap-4 ${className ?? ''}`}
    >
      <legend className="sr-only">Filter options</legend>
      <label
        htmlFor="filter-reasoning"
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          id="filter-reasoning"
          type="checkbox"
          checked={filters.reasoning === true}
          onChange={handleFilterChange('reasoning')}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          aria-label="Filter by reasoning capability"
        />
        <span className="text-sm text-gray-700 hover:text-gray-900">
          Reasoning
        </span>
      </label>

      <label
        htmlFor="filter-tool-call"
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          id="filter-tool-call"
          type="checkbox"
          checked={filters.toolCall === true}
          onChange={handleFilterChange('toolCall')}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          aria-label="Filter by tool calling capability"
        />
        <span className="text-sm text-gray-700 hover:text-gray-900">
          Tool Calling
        </span>
      </label>

      <label
        htmlFor="filter-open-weights"
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <input
          id="filter-open-weights"
          type="checkbox"
          checked={filters.openWeights === true}
          onChange={handleFilterChange('openWeights')}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          aria-label="Filter by open weights availability"
        />
        <span className="text-sm text-gray-700 hover:text-gray-900">
          Open Weights
        </span>
      </label>
    </fieldset>
  )
}
