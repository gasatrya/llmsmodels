import { useCallback, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react'
import { ProviderFilter } from './ProviderFilter'
import { CapabilityFilter } from './CapabilityFilter'
import type { FilterState } from '@/types/filters'
import { defaultFilters } from '@/types/filters'

interface FilterPanelProps {
  providers: Array<{ id: string; name: string }>
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export function FilterPanel({
  providers,
  filters,
  onFiltersChange,
  className,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const activeFilterCount = useMemo(() => {
    let count = 0
    count += filters.providers.length
    count += Object.values(filters.capabilities).filter(
      (v) => v === true,
    ).length
    return count
  }, [filters])

  const updateFilter = useCallback(
    <TKey extends keyof FilterState>(key: TKey, value: FilterState[TKey]) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange],
  )

  const clearAll = useCallback(() => {
    onFiltersChange(defaultFilters)
  }, [onFiltersChange])

  const togglePanel = () => setIsExpanded(!isExpanded)

  return (
    <aside
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className ?? ''}`}
      aria-label="Filter options"
    >
      <button
        onClick={togglePanel}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-6">
          <ProviderFilter
            providers={providers}
            selected={filters.providers}
            onChange={(selected) => updateFilter('providers', selected)}
          />

          <CapabilityFilter
            capabilities={filters.capabilities}
            onChange={(capabilities) =>
              updateFilter('capabilities', capabilities)
            }
          />

          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
