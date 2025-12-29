import { LayoutGrid, RotateCcw, Wrench } from 'lucide-react'

interface Capabilities {
  reasoning?: boolean
  toolCall?: boolean
  structuredOutput?: boolean
}

interface CapabilityFilterProps {
  capabilities: Capabilities
  onChange: (capabilities: Capabilities) => void
  className?: string
}

const CAPABILITIES = [
  {
    key: 'reasoning' as const,
    label: 'Reasoning',
    description: 'Models with chain-of-thought reasoning',
    icon: RotateCcw,
  },
  {
    key: 'toolCall' as const,
    label: 'Tool Call',
    description: 'Models that support function/tool calling',
    icon: Wrench,
  },
  {
    key: 'structuredOutput' as const,
    label: 'Structured Output',
    description: 'Models that return JSON/structured data',
    icon: LayoutGrid,
  },
] as const

export function CapabilityFilter({
  capabilities,
  onChange,
  className,
}: CapabilityFilterProps) {
  const toggleCapability = (key: keyof Capabilities) => {
    const currentValue = capabilities[key]
    onChange({
      ...capabilities,
      [key]: !currentValue,
    })
  }

  const hasActiveFilters = Object.values(capabilities).some((v) => v === true)

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Capabilities</h3>
      </div>

      <div className="space-y-2">
        {CAPABILITIES.map((capability) => {
          const isActive = capabilities[capability.key] === true
          const Icon = capability.icon

          return (
            <label
              key={capability.key}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => toggleCapability(capability.key)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label={`Toggle ${capability.label}`}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700">
                    {capability.label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {capability.description}
                </p>
              </div>
            </label>
          )
        })}
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => onChange({})}
          className="w-full px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
        >
          Reset Capabilities
        </button>
      )}
    </div>
  )
}
