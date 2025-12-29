import { useCallback, useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'

interface ProviderFilterProps {
  providers: Array<{ id: string; name: string }>
  selected: Array<string>
  onChange: (selected: Array<string>) => void
  className?: string
}

export function ProviderFilter({
  providers,
  selected,
  onChange,
  className,
}: ProviderFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProviders = useMemo(() => {
    if (!searchQuery.trim()) {
      return providers
    }
    const query = searchQuery.toLowerCase()
    return providers.filter((p) => p.name.toLowerCase().includes(query))
  }, [providers, searchQuery])

  const toggleProvider = useCallback(
    (providerId: string) => {
      if (selected.includes(providerId)) {
        onChange(selected.filter((id) => id !== providerId))
      } else {
        onChange([...selected, providerId])
      }
    },
    [selected, onChange],
  )

  const selectAll = useCallback(() => {
    const allIds = filteredProviders.map((p) => p.id)
    onChange([...new Set([...selected, ...allIds])])
  }, [filteredProviders, selected, onChange])

  const clearAll = useCallback(() => {
    onChange([])
  }, [onChange])

  const allSelected =
    filteredProviders.length > 0 &&
    filteredProviders.every((p) => selected.includes(p.id))

  const selectedCount = selected.length

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Providers</h3>
        <span className="text-xs text-gray-500">
          {selectedCount > 0 ? `${selectedCount} selected` : ''}
        </span>
      </div>

      <div className="relative">
        <Search
          className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search providers..."
          className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Search providers"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={selectAll}
          disabled={allSelected}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          disabled={selectedCount === 0}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {filteredProviders.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">
            No providers found
          </div>
        ) : (
          filteredProviders.map((provider) => {
            const isSelected = selected.includes(provider.id)
            return (
              <label
                key={provider.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleProvider(provider.id)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Select ${provider.name}`}
                />
                <span className="text-sm text-gray-700">{provider.name}</span>
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
