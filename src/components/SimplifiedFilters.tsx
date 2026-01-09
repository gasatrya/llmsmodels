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
        className="flex items-center gap-2 cursor-pointer select-none group bg-white border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <input
          id="filter-reasoning"
          type="checkbox"
          checked={filters.reasoning === true}
          onChange={handleFilterChange('reasoning')}
          className="w-5 h-5 rounded-none border-2 border-black bg-white checked:bg-black checked:text-white focus:ring-0 transition-colors appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:left-[3px] checked:after:top-[-1px] checked:after:text-sm checked:after:font-bold"
          aria-label="Filter by reasoning capability"
        />
        <span className="text-sm text-black group-hover:text-black transition-colors font-bold uppercase">
          Reasoning
        </span>
      </label>

      <label
        htmlFor="filter-tool-call"
        className="flex items-center gap-2 cursor-pointer select-none group bg-white border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <input
          id="filter-tool-call"
          type="checkbox"
          checked={filters.toolCall === true}
          onChange={handleFilterChange('toolCall')}
          className="w-5 h-5 rounded-none border-2 border-black bg-white checked:bg-black checked:text-white focus:ring-0 transition-colors appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:left-[3px] checked:after:top-[-1px] checked:after:text-sm checked:after:font-bold"
          aria-label="Filter by tool calling capability"
        />
        <span className="text-sm text-black group-hover:text-black transition-colors font-bold uppercase">
          Tool Calling
        </span>
      </label>

      <label
        htmlFor="filter-open-weights"
        className="flex items-center gap-2 cursor-pointer select-none group bg-white border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <input
          id="filter-open-weights"
          type="checkbox"
          checked={filters.openWeights === true}
          onChange={handleFilterChange('openWeights')}
          className="w-5 h-5 rounded-none border-2 border-black bg-white checked:bg-black checked:text-white focus:ring-0 transition-colors appearance-none relative checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:left-[3px] checked:after:top-[-1px] checked:after:text-sm checked:after:font-bold"
          aria-label="Filter by open weights availability"
        />
        <span className="text-sm text-black group-hover:text-black transition-colors font-bold uppercase">
          Open Weights
        </span>
      </label>
    </fieldset>
  )
}
