# AI Models Explorer - Technical Specification Document

**Version:** 1.3.0
**Last Updated:** 2025-12-28
**Status:** Draft
**Project:** Models Explorer (models.dev alternative)

---

## 1. Executive Summary

### 1.1 Project Overview

The AI Models Explorer is a web application that provides a comprehensive, performant interface for browsing and comparing AI models from various providers. The application serves as an enhanced alternative to models.dev, offering improved user experience, advanced filtering capabilities, side-by-side model comparison, and seamless data synchronization with the models.dev API.

The platform aggregates AI model information from multiple providers into a single, searchable interface. Users can filter models by various attributes such as capabilities (reasoning, tool calling), cost, release date, and supported modalities. The comparison feature allows users to select up to four models and view their specifications side-by-side with highlighted differences.

### 1.2 Goals and Objectives

**Primary Goals:**

1. **Performance Excellence:** Achieve sub-second load times and 60fps interactions even with large model datasets (500+ models)
2. **User Empowerment:** Enable users to quickly find and compare models using intuitive filters and search
3. **Data Accuracy:** Ensure model information is always current with automated 24-hour refresh cycles
4. **Accessibility:** Create an inclusive interface that works for all users regardless of device or ability

**Secondary Objectives:**

- Minimize bundle size to under 200KB gzipped for initial load
- Achieve 100% TypeScript coverage for all data structures
- Maintain zero layout shift during data loading
- Support all modern browsers (Chrome, Firefox, Safari, Edge)

### 1.3 TanStack Ecosystem Integration

This project leverages the full TanStack ecosystem for a cohesive, type-safe development experience:

| Library              | Purpose                 | Benefits                                        |
| -------------------- | ----------------------- | ----------------------------------------------- |
| **TanStack Start**   | Full-stack framework    | SSR, server functions, file-based routing       |
| **TanStack Router**  | Type-safe routing       | File-based routes, search params, middleware    |
| **TanStack Query**   | Data fetching & caching | Built-in caching, background refetch, deduping  |
| **TanStack Virtual** | Virtual scrolling       | Efficient rendering of large lists (500+ items) |
| **TanStack Table**   | Data tables             | Headless UI for comparison tables               |

**Why the TanStack Ecosystem:**

1. **Cohesive Tooling:** All libraries share similar APIs, patterns, and TypeScript support
2. **Type Safety:** End-to-end type safety from server to client
3. **Performance:** Optimized for performance with minimal bundle size
4. **Developer Experience:** Excellent DevTools, debugging, and monitoring
5. **Community:** Active maintenance and large community support

### 1.3 Success Metrics

| Metric                         | Target          | Measurement Method |
| ------------------------------ | --------------- | ------------------ |
| First Contentful Paint (FCP)   | < 800ms         | Lighthouse         |
| Largest Contentful Paint (LCP) | < 1.5s          | Lighthouse         |
| Time to Interactive (TTI)      | < 2s            | Lighthouse         |
| First Input Delay (FID)        | < 100ms         | Lighthouse         |
| Bundle Size (initial)          | < 200KB gzipped | Lighthouse         |
| Test Coverage                  | > 80%           | Vitest/Coverage    |
| Accessibility Score            | 100             | Lighthouse/Axe     |

---

## 2. Technical Architecture

### 2.1 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Browser   │  │   Local     │  │     Netlify CDN         │ │
│  │   (SSR+SPA) │  │   Storage   │  │   (Static Assets)       │ │
│  └──────┬──────┘  └─────────────┘  └─────────────────────────┘ │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              TanStack Router (File-based)                  │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   /      │  │ /compare │  │ /search  │  │ /models  │  │  │
│  │  │  (Home)  │  │          │  │          │  │ /:id     │  │  │
│  │  │          │  │          │  │          │  │          │  │  │
│  │  │  loader  │  │  loader  │  │  loader  │  │  loader  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            TanStack Query v5 (Data Management)             │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │ QueryCache │  │ QueryClient│  │   Built-in Cache   │   │  │
│  │  │            │  │            │  │   staleTime: 24h   │   │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              TanStack Virtual (Virtual Scrolling)          │  │
│  │              TanStack Table (Comparison Tables)            │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Server Functions Layer                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         TanStack Start Server Functions (createServerFn)   │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │ fetchModels│  │transform   │  │   API Integration  │   │  │
│  │  │  (SSR)     │  │   Data     │  │   (models.dev)     │   │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
1. Initial Load (SSR + Hydration):
   ┌──────────┐     ┌──────────────┐     ┌─────────────────┐
   │  loader  │────▶│ createServer │────▶│ models.dev      │
   │ (server) │     │      Fn      │     │ /api.json       │
   └──────────┘     └──────────────┘     └─────────────────┘
        │                                      │
        │  JSON Response                       │
        │  { providers: {...} }                │
        │◀─────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Server-Side Data Transformation              │
   │  - Flatten nested provider/model structure   │
   │  - Create search index (Fuse.js)             │
   │  - Return hydrated HTML with data            │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Client Hydration                            │
   │  - React Query takes ownership of data       │
   │  - Use initialData from server loader        │
   │  - staleTime: 24h cache window               │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  UI Update                                    │
   │  - Virtual list renders visible items         │
   │  - Filters applied to computed dataset        │
   │  - Search results highlighted                 │
   └──────────────────────────────────────────────┘

2. User Interaction:
   ┌──────────┐     ┌──────────────┐     ┌─────────────────┐
   │ Filter   │────▶│ URL Update   │────▶│ Router          │
   │ Change   │     │ (pushState)  │     │ (history API)   │
   └──────────┘     └──────────────┘     └─────────────────┘
        │                                         │
        │  Re-render                              │
        │◀────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Computed Properties                          │
   │  filteredModels = allModels.filter(filters)   │
   │  sortedModels = filteredModels.sort(sort)     │
   │  visibleModels = sortedModels.slice(0, 50)   │
   └──────────────────────────────────────────────┘
```

### 2.3 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ AppRoot (__root.tsx)                                         │
│ ├─ Header                                                    │
│ │  ├─ Logo                                                    │
│ │  ├─ SearchBar                                               │
│ │  └─ ThemeToggle (future)                                    │
│ ├─ RouterOutlet                                               │
│ │  ├─ IndexRoute (/)                                          │
│ │  │  ├─ FilterPanel                                          │
│ │  │  │  ├─ ProviderFilter                                    │
│ │  │  │  ├─ CapabilityFilter                                  │
│ │  │  │  ├─ CostRangeFilter                                   │
│ │  │  │  ├─ DateRangeFilter                                   │
│ │  │  │  └─ ModalitiesFilter                                  │
│ │  │  ├─ ModelList                                            │
│ │  │  │  ├─ VirtualListContainer                              │
│ │  │  │  │  └─ ModelCard (×visible count)                     │
│ │  │  │  └─ ScrollObserver                                    │
│ │  │  └─ ComparisonBar                                        │
│ │  │     └─ SelectedModelsChip (×n)                           │
│ │  ├─ CompareRoute (/compare)                                 │
│ │  │  ├─ ComparisonHeader                                     │
│ │  │  ├─ ComparisonTable                                      │
│ │  │  │  └─ ComparisonRow (×model count)                      │
│ │  │  └─ ShareButton                                          │
│ │  └─ ModelDetailRoute (/models/:modelId)                     │
│ │     ├─ ModelHeader                                          │
│ │     ├─ ModelCapabilities                                    │
│ │     └─ RelatedModels                                        │
│ └─ ErrorBoundary                                             │
│    └─ ErrorFallback                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Management

### 3.1 TanStack Start Server Functions

TanStack Start provides `createServerFn` for type-safe server-side data fetching. This pattern enables both SSR data prefetching and client-side data synchronization through TanStack Query.

**Server Function for Fetching Models:**

```typescript
// src/lib/models-api.ts
import { createServerFn } from '@tanstack/react-start'

export interface ModelsApiResponse {
  [providerId: string]: {
    id: string
    name: string
    env: string[]
    npm: string
    api: string
    doc: string
    models: {
      [modelId: string]: {
        id: string
        name: string
        family: string
        attachment: boolean
        reasoning: boolean
        tool_call: boolean
        temperature: boolean
        knowledge: string
        release_date: string
        last_updated: string
        modalities: {
          input: string[]
          output: string[]
        }
        open_weights: boolean
        cost: {
          input: number
          output: number
          cache_read?: number
          cache_write?: number
        }
        limit: {
          context: number
          output: number
        }
      }
    }
  }
}

export const fetchModels = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await fetch('https://models.dev/api.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json() as Promise<ModelsApiResponse>
  })
```

**TanStack Query Configuration:**

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 24 hours - data remains fresh for a full day
      staleTime: 24 * 60 * 60 * 1000,
      // Keep unused data in memory for 24 hours
      gcTime: 24 * 60 * 60 * 1000,
      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})
```

**Why TanStack Query's Built-in Caching is Sufficient:**

1. **Industry Standard:** TanStack Query is the de facto standard for React data fetching, used by thousands of production applications
2. **Memory Efficient:** Automatic garbage collection based on `gcTime` prevents memory leaks
3. **Smart Refetching:** Built-in strategies for background refetching, deduping, and stale-while-revalidate
4. **No Custom Code:** Eliminates the need for custom cache management, reducing bugs and maintenance
5. **DevTools Integration:** Built-in DevTools for cache inspection and debugging

**Key Considerations:**

1. **Single Fetch, No Pagination:** The API returns all data at once. Fetch once and cache for 24 hours
2. **Background Refresh:** Data automatically refetches when cache expires (when user returns to app after 24h)
3. **Error Handling:** Graceful degradation with retry logic and error boundaries
4. **Loading States:** Skeleton screens during initial fetch, instant loads after cache
5. **SSR Integration:** Use `initialData` from server loader to hydrate TanStack Query cache

### 3.2 Data Transformation

The API returns nested provider/model structure. Flatten for easier processing:

```typescript
// src/lib/models-transform.ts
import type {
  ApiResponse,
  Provider,
  Model,
  FlattenedModel,
} from '@/types/models'

export function flattenModelsData(response: ApiResponse): FlattenedModel[] {
  const models: FlattenedModel[] = []

  for (const [providerId, provider] of Object.entries(response)) {
    for (const [modelId, model] of Object.entries(provider.models)) {
      models.push({
        // Composite ID for uniqueness
        id: `${providerId}/${modelId}`,
        providerId,
        providerName: provider.name,
        // Model fields
        modelId,
        modelName: model.name,
        family: model.family,
        // Capabilities (boolean flags)
        attachment: model.attachment,
        reasoning: model.reasoning,
        toolCall: model.tool_call,
        temperature: model.temperature,
        // Dates
        knowledgeDate: model.knowledge,
        releaseDate: model.release_date,
        lastUpdated: model.last_updated,
        // Modalities
        inputModalities: model.modalities.input,
        outputModalities: model.modalities.output,
        // Access
        openWeights: model.open_weights,
        // Costs (normalized to dollars per 1M tokens)
        cost: {
          input: model.cost.input,
          output: model.cost.output,
          cacheRead: model.cost.cache_read ?? null,
          cacheWrite: model.cost.cache_write ?? null,
        },
        // Limits
        limits: {
          context: model.limit.context,
          output: model.limit.output,
        },
        // Metadata
        npm: provider.npm,
        apiEndpoint: provider.api,
        documentation: provider.doc,
        environment: provider.env,
      })
    }
  }

  return models
}
```

### 3.3 Search Indexing

Use Fuse.js for client-side fuzzy search across provider and model names:

```typescript
// src/lib/models-search.ts
import Fuse from 'fuse.js'
import type { FlattenedModel } from '@/types/models'

export interface SearchOptions {
  keys: string[]
  threshold: number
  includeScore: boolean
  includeMatches: boolean
}

export function createSearchIndex(models: FlattenedModel[]) {
  const options: SearchOptions = {
    keys: ['providerName', 'modelName'],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
  }

  return new Fuse(models, options)
}

export interface SearchResult {
  item: FlattenedModel
  score?: number
  matches?: readonly Fuse.FuseResultMatch[]
}

export function searchModels(
  fuse: Fuse<FlattenedModel>,
  query: string,
): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  return fuse.search(query.trim(), {
    limit: 100,
  })
}
```

**Search Configuration:**

- Keys: `['providerName', 'modelName']` only (no technical specs)
- Threshold: 0.3 (balanced between precision and recall)
- Limit: 100 results maximum
- No fuzzy search across modalities, costs, or other attributes

### 3.4 State Management Approach

**URL State (Authoritative):**

- Search query
- Provider filters
- Capability filters
- Cost range
- Date range
- Sort order and direction
- Comparison list

**LocalStorage State (Persistence):**

- Last applied filters (for restoration)
- Bookmarked models
- Theme preference

**Component State (Transient):**

- Modal open/close states
- Loading states
- Error states
- UI interactions (hover, focus)

---

## 4. Core Features Specifications

### 4.1 Virtual Model List

**Implementation with TanStack Virtual:**

```typescript
// src/components/ModelList/ModelList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef } from 'react'
import type { FlattenedModel } from '@/types/models'
import { ModelCard } from './ModelCard'

interface ModelListProps {
  models: FlattenedModel[]
  onModelSelect: (model: FlattenedModel) => void
  selectedModels: string[]
}

export function ModelList({ models, onModelSelect, selectedModels }: ModelListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: models.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Card height estimate
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto container-padding"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const model = models[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ModelCard
                model={model}
                isSelected={selectedModels.includes(model.id)}
                onSelect={() => onModelSelect(model)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Performance Considerations:**

1. **Virtualization:** Only render visible items + buffer (5 items overscan)
2. **Card Height:** Fixed height cards (280px) for predictable calculations
3. **Windowing:** Use `useVirtualizer` from `@tanstack/react-virtual`
4. **Memoization:** Memoize expensive computations with `useMemo`
5. **Image Loading:** Lazy load model icons and provider logos

**Card Component Structure:**

```typescript
// src/components/ModelList/ModelCard.tsx
interface ModelCardProps {
  model: FlattenedModel
  isSelected: boolean
  onSelect: () => void
}

export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Select ${model.modelName} for comparison`}
        />
        <img
          src={`/logos/${model.providerId}.png`}
          alt=""
          loading="lazy"
          className={styles.providerLogo}
        />
        <div className={styles.modelInfo}>
          <h3 className={styles.modelName}>{model.modelName}</h3>
          <span className={styles.providerName}>{model.providerName}</span>
        </div>
      </div>

      <div className={styles.capabilities}>
        {model.reasoning && <Badge variant="reasoning">Reasoning</Badge>}
        {model.toolCall && <Badge variant="tool">Tools</Badge>}
        {model.openWeights && <Badge variant="open">Open Weights</Badge>}
      </div>

      <div className={styles.cost}>
        <CostDisplay cost={model.cost} />
      </div>

      <div className={styles.modalities}>
        {model.inputModalities.map((m) => (
          <Badge key={m} variant="modality">{m}</Badge>
        ))}
      </div>

      <Link to="/models/$modelId" params={{ modelId: model.id }} className={styles.detailsLink}>
        View Details
      </Link>
    </div>
  )
}
```

**Infinite Scroll vs Virtual List Decision:**

- **Virtual List** is preferred for this use case because:
  - All data is loaded upfront (no pagination from API)
  - Predictable item heights simplify implementation
  - Better performance for filtering (re-filtering existing data)
  - Smoother scroll experience with fixed item heights

### 4.2 Advanced Filtering System

**Filter Types:**

| Filter       | Type         | UI Component   | Options                          |
| ------------ | ------------ | -------------- | -------------------------------- |
| Provider     | Multi-select | Checkbox list  | Dynamic (from data)              |
| Capabilities | Multi-select | Toggle buttons | reasoning, toolCall, openWeights |
| Cost Range   | Range        | Dual slider    | 0 - $100+/M tokens               |
| Date Range   | Range        | Date picker    | Release date range               |
| Modalities   | Multi-select | Checkbox list  | input/output types               |
| Open Weights | Boolean      | Toggle         | Yes/No                           |

**Filter State Interface:**

```typescript
// src/types/models.ts
export interface FilterState {
  providers: string[]
  capabilities: {
    reasoning: boolean | null
    toolCall: boolean | null
    openWeights: boolean | null
  }
  costRange: {
    min: number
    max: number | null // null = unlimited
  }
  dateRange: {
    start: string | null // YYYY-MM format
    end: string | null
  }
  modalities: {
    input: string[]
    output: string[]
  }
}

export const defaultFilters: FilterState = {
  providers: [],
  capabilities: {
    reasoning: null,
    toolCall: null,
    openWeights: null,
  },
  costRange: {
    min: 0,
    max: null,
  },
  dateRange: {
    start: null,
    end: null,
  },
  modalities: {
    input: [],
    output: [],
  },
}
```

**Filter Logic Implementation:**

```typescript
// src/lib/models-filters.ts
import type { FlattenedModel, FilterState } from '@/types/models'

export function applyFilters(
  models: FlattenedModel[],
  filters: FilterState,
): FlattenedModel[] {
  return models.filter((model) => {
    // Provider filter
    if (
      filters.providers.length > 0 &&
      !filters.providers.includes(model.providerId)
    ) {
      return false
    }

    // Capability filters
    if (filters.capabilities.reasoning === true && !model.reasoning) {
      return false
    }
    if (filters.capabilities.toolCall === true && !model.toolCall) {
      return false
    }
    if (filters.capabilities.openWeights === true && !model.openWeights) {
      return false
    }

    // Cost filter
    const totalCost = model.cost.input + model.cost.output
    if (filters.costRange.min > 0 && totalCost < filters.costRange.min) {
      return false
    }
    if (filters.costRange.max !== null && totalCost > filters.costRange.max) {
      return false
    }

    // Date filter
    if (
      filters.dateRange.start &&
      model.releaseDate < filters.dateRange.start
    ) {
      return false
    }
    if (filters.dateRange.end && model.releaseDate > filters.dateRange.end) {
      return false
    }

    // Modalities filter
    if (filters.modalities.input.length > 0) {
      const hasInput = filters.modalities.input.some((m) =>
        model.inputModalities.includes(m),
      )
      if (!hasInput) return false
    }
    if (filters.modalities.output.length > 0) {
      const hasOutput = filters.modalities.output.some((m) =>
        model.outputModalities.includes(m),
      )
      if (!hasOutput) return false
    }

    return true
  })
}
```

**URL State Synchronization:**

```typescript
// src/lib/url-state.ts
import { createSearchParams } from '@tanstack/react-router'
import type { FilterState } from '@/types/models'

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.providers.length > 0) {
    params.set('providers', filters.providers.join(','))
  }

  if (filters.capabilities.reasoning !== null) {
    params.set('reasoning', String(filters.capabilities.reasoning))
  }

  if (filters.costRange.max !== null) {
    params.set('maxCost', String(filters.costRange.max))
  }

  if (filters.dateRange.start) {
    params.set('dateFrom', filters.dateRange.start)
  }

  return params
}

export function searchParamsToFilters(
  params: URLSearchParams,
): Partial<FilterState> {
  const providers = params.get('providers')?.split(',').filter(Boolean) ?? []

  const reasoning = params.get('reasoning')
  const maxCost = params.get('maxCost')
  const dateFrom = params.get('dateFrom')

  return {
    providers,
    capabilities: {
      reasoning: reasoning === null ? null : reasoning === 'true',
      toolCall: null,
      openWeights: null,
    },
    costRange: {
      min: 0,
      max: maxCost ? Number(maxCost) : null,
    },
    dateRange: {
      start: dateFrom ?? null,
      end: null,
    },
    modalities: { input: [], output: [] },
  }
}
```

### 4.3 Search System

**Search Input with Debouncing:**

```typescript
// src/components/SearchBar/SearchBar.tsx
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useCallback, useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search models...' }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  // Sync debounced value to parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  return (
    <div className={styles.searchContainer}>
      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-label="Search models and providers"
        autoComplete="off"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue('')
            onChange('')
          }}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}
```

**Search Scope:**

The search system only searches across:

- `model.modelName` - Display name of the model
- `model.providerName` - Name of the provider

No search across:

- Technical specifications
- Capability flags
- Cost information
- Modalities
- Release dates

**Search Results Highlighting:**

```typescript
// src/components/SearchBar/SearchHighlight.tsx
import type { FuseMatch } from 'fuse.js'

interface SearchHighlightProps {
  text: string
  matches: FuseMatch[]
}

export function SearchHighlight({ text, matches }: SearchHighlightProps) {
  if (!matches.length) return <>{text}</>

  // Build highlight spans from match indices
  const ranges: [number, number][] = []

  for (const match of matches) {
    if (match.key === 'modelName' || match.key === 'providerName') {
      for (const indices of match.indices) {
        ranges.push(indices)
      }
    }
  }

  // Sort and merge overlapping ranges
  const sortedRanges = ranges.sort((a, b) => a[0] - b[0])
  const mergedRanges = sortedRanges.reduce<[number, number][]>((acc, curr) => {
    if (acc.length === 0) return [curr]
    const last = acc[acc.length - 1]
    if (curr[0] <= last[1]) {
      acc[acc.length - 1] = [last[0], Math.max(last[1], curr[1])]
      return acc
    }
    return [...acc, curr]
  }, [])

  // Build JSX with highlighted segments
  let lastIndex = 0
  const elements: JSX.Element[] = []

  for (const [start, end] of mergedRanges) {
    if (start > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, start)}</span>)
    }
    elements.push(
      <span key={`highlight-${start}`} className={styles.highlight}>
        {text.slice(start, end + 1)}
      </span>
    )
    lastIndex = end + 1
  }

  if (lastIndex < text.length) {
    elements.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <>{elements}</>
}
```

### 4.4 Comparison Mode

**Selection Mechanism:**

```typescript
// src/hooks/useComparison.ts
import { useCallback, useState } from 'react'
import type { FlattenedModel } from '@/types/models'

const MAX_COMPARISON = 4

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('comparison-selection')
    return saved ? JSON.parse(saved) : []
  })

  const toggleModel = useCallback((modelId: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(modelId)

      let next: string[]
      if (isSelected) {
        next = prev.filter((id) => id !== modelId)
      } else if (prev.length < MAX_COMPARISON) {
        next = [...prev, modelId]
      } else {
        // Already at max, don't add
        return prev
      }

      localStorage.setItem('comparison-selection', JSON.stringify(next))
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
    localStorage.removeItem('comparison-selection')
  }, [])

  return {
    selectedIds,
    toggleModel,
    clearSelection,
    canAddMore: selectedIds.length < MAX_COMPARISON,
    isSelected: (id: string) => selectedIds.includes(id),
  }
}
```

**Comparison Modal/Panel:**

```typescript
// src/components/ComparisonModal/ComparisonModal.tsx
import type { FlattenedModel } from '@/types/models'

interface ComparisonModalProps {
  models: FlattenedModel[]
  isOpen: boolean
  onClose: () => void
}

export function ComparisonModal({ models, isOpen, onClose }: ComparisonModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Compare Models</h2>
          <button onClick={onClose} aria-label="Close comparison">×</button>
        </div>

        <div className={styles.content}>
          <ComparisonTable models={models} />
        </div>

        <div className={styles.footer}>
          <ShareButton models={models} />
        </div>
      </div>
    </div>
  )
}
```

**Side-by-Side Comparison Table:**

```typescript
// src/components/ComparisonModal/ComparisonTable.tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import type { FlattenedModel } from '@/types/models'

interface ComparisonTableProps {
  models: FlattenedModel[]
}

export function ComparisonTable({ models }: ComparisonTableProps) {
  const columns = useMemo(() => [
    {
      header: 'Property',
      accessorKey: 'property',
    },
    ...models.map((model) => ({
      header: model.modelName,
      accessorKey: model.id,
    })),
  ], [models])

  const data = useMemo(() => [
    { property: 'Provider', [models[0]?.id]: models[0]?.providerName, [models[1]?.id]: models[1]?.providerName },
    { property: 'Release Date', [models[0]?.id]: models[0]?.releaseDate, [models[1]?.id]: models[1]?.releaseDate },
    { property: 'Reasoning', [models[0]?.id]: models[0]?.reasoning ? 'Yes' : 'No', [models[1]?.id]: models[1]?.reasoning ? 'Yes' : 'No' },
    { property: 'Tool Calling', [models[0]?.id]: models[0]?.toolCall ? 'Yes' : 'No', [models[1]?.id]: models[1]?.toolCall ? 'Yes' : 'No' },
    { property: 'Open Weights', [models[0]?.id]: models[0]?.openWeights ? 'Yes' : 'No', [models[1]?.id]: models[1]?.openWeights ? 'Yes' : 'No' },
    { property: 'Input Cost', [models[0]?.id]: `$${models[0]?.cost.input}/M`, [models[1]?.id]: `$${models[1]?.cost.input}/M` },
    { property: 'Output Cost', [models[0]?.id]: `$${models[0]?.cost.output}/M`, [models[1]?.id]: `$${models[1]?.cost.output}/M` },
    { property: 'Context Limit', [models[0]?.id]: formatNumber(models[0]?.limits.context), [models[1]?.id]: formatNumber(models[1]?.limits.context) },
    { property: 'Output Limit', [models[0]?.id]: formatNumber(models[0]?.limits.output), [models[1]?.id]: formatNumber(models[1]?.limits.output) },
  ], [models])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table className={styles.table}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <ComparisonRow key={row.id} row={row} models={models} />
        ))}
      </tbody>
    </table>
  )
}
```

**Highlight Differences:**

```typescript
// src/components/ComparisonModal/ComparisonRow.tsx
interface ComparisonRowProps {
  row: Row
  models: FlattenedModel[]
}

function ComparisonRow({ row, models }: ComparisonRowProps) {
  const values = models.map((m) => row.getValue(m.id))
  const allEqual = values.every((v) => v === values[0])

  return (
    <tr className={allEqual ? '' : styles.highlightDifference}>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}
```

**Share via URL:**

```typescript
// src/lib/share.ts
export function generateShareUrl(models: FlattenedModel[]): string {
  const modelIds = models.map((m) => m.id).join(',')
  const url = new URL(window.location.href)
  url.searchParams.set('compare', modelIds)
  return url.toString()
}

export function parseShareUrl(searchParams: URLSearchParams): string[] {
  const compare = searchParams.get('compare')
  if (!compare) return []
  return compare.split(',').filter(Boolean)
}
```

### 4.5 Sort System

**Sort Options:**

```typescript
// src/types/sort.ts
export type SortField = 'name' | 'provider' | 'releaseDate' | 'cost' | 'context'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Model Name' },
  { value: 'provider', label: 'Provider' },
  { value: 'releaseDate', label: 'Release Date' },
  { value: 'cost', label: 'Cost (Input + Output)' },
  { value: 'context', label: 'Context Length' },
]

export function compareModels(
  a: FlattenedModel,
  b: FlattenedModel,
  sort: SortState,
): number {
  const direction = sort.direction === 'asc' ? 1 : -1

  switch (sort.field) {
    case 'name':
      return direction * a.modelName.localeCompare(b.modelName)
    case 'provider':
      return direction * a.providerName.localeCompare(b.providerName)
    case 'releaseDate':
      return (
        direction *
        (new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())
      )
    case 'cost':
      const costA = a.cost.input + a.cost.output
      const costB = b.cost.input + b.cost.output
      return direction * (costA - costB)
    case 'context':
      return direction * (a.limits.context - b.limits.context)
    default:
      return 0
  }
}
```

**Multi-Sort Support (Future):**

For Phase 4 or later, consider implementing multi-sort with:

- Sort priority queue
- Visual sort indicators (multiple arrows)
- Keyboard shortcuts (Shift+Click for secondary sort)

---

## 5. Component Specifications

### 5.1 ModelList Component

```typescript
// src/components/ModelList/ModelList.tsx
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useCallback } from 'react'
import type { FlattenedModel } from '@/types/models'
import { ModelCard } from './ModelCard'

interface ModelListProps {
  models: FlattenedModel[]
  onModelSelect: (model: FlattenedModel) => void
  selectedIds: string[]
  isLoading: boolean
  error: Error | null
}

export function ModelList({
  models,
  onModelSelect,
  selectedIds,
  isLoading,
  error,
}: ModelListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: models.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 5,
  })

  const handleSelect = useCallback(
    (model: FlattenedModel) => {
      onModelSelect(model)
    },
    [onModelSelect],
  )

  if (isLoading) {
    return <SkeletonList count={10} />
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />
  }

  if (models.length === 0) {
    return <EmptyState message="No models found matching your criteria" />
  }

  return (
    <div
      ref={parentRef}
      className="overflow-auto container-padding"
      style={{ height: 'calc(100vh - 280px)' }}
    >
      <div
        style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ModelCard
              model={models[virtualRow.index]}
              isSelected={selectedIds.includes(models[virtualRow.index].id)}
              onSelect={() => handleSelect(models[virtualRow.index])}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5.2 FilterPanel Component

```typescript
// src/components/FilterPanel/FilterPanel.tsx
import { useState, useCallback } from 'react'
import type { FilterState } from '@/types/models'
import { ProviderFilter } from './ProviderFilter'
import { CapabilityFilter } from './CapabilityFilter'
import { CostRangeFilter } from './CostRangeFilter'
import { DateRangeFilter } from './DateRangeFilter'

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  providers: { id: string; name: string }[]
}

export function FilterPanel({ filters, onFiltersChange, providers }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange],
  )

  return (
    <aside className={styles.panel} aria-label="Filter options">
      <button
        className={styles.toggle}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        Filters
        <span className={styles.toggleIcon}>{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          <ProviderFilter
            providers={providers}
            selected={filters.providers}
            onChange={(selected) => updateFilter('providers', selected)}
          />

          <CapabilityFilter
            capabilities={filters.capabilities}
            onChange={(capabilities) => updateFilter('capabilities', capabilities)}
          />

          <CostRangeFilter
            range={filters.costRange}
            onChange={(range) => updateFilter('costRange', range)}
          />

          <DateRangeFilter
            range={filters.dateRange}
            onChange={(range) => updateFilter('dateRange', range)}
          />

          <button
            className={styles.clearButton}
            onClick={() => onFiltersChange(defaultFilters)}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </aside>
  )
}
```

### 5.3 SearchBar Component

```typescript
// src/components/SearchBar/SearchBar.tsx
import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search models and providers...',
  className,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useDebounce(inputValue, 300)

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('')
  }, [onChange])

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
      </svg>

      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
        aria-label="Search models and providers"
      />

      {inputValue && (
        <button
          onClick={handleClear}
          className={styles.clear}
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      )}
    </div>
  )
}
```

### 5.4 ComparisonModal Component

```typescript
// src/components/ComparisonModal/ComparisonModal.tsx
import { useCallback, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { FlattenedModel } from '@/types/models'
import { ComparisonTable } from './ComparisonTable'
import { ShareButton } from './ShareButton'

interface ComparisonModalProps {
  models: FlattenedModel[]
  isOpen: boolean
  onClose: () => void
}

export function ComparisonModal({ models, isOpen, onClose }: ComparisonModalProps) {
  const navigate = useNavigate()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleShare = useCallback(async () => {
    const url = generateShareUrl(models)
    await navigator.clipboard.writeText(url)
    // Show toast notification
  }, [models])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
      >
        <header className={styles.header}>
          <h2 id="comparison-title">Compare Models</h2>
          <div className={styles.headerActions}>
            <ShareButton onShare={handleShare} />
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close comparison"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {models.length < 2 ? (
            <p className={styles.emptyMessage}>
              Select at least 2 models to compare
            </p>
          ) : (
            <ComparisonTable models={models} />
          )}
        </div>
      </div>
    </div>
  )
}

function generateShareUrl(models: FlattenedModel[]): string {
  const modelIds = models.map((m) => m.id).join(',')
  const url = new URL(window.location.href)
  url.searchParams.set('compare', modelIds)
  return url.toString()
}
```

### 5.5 Shared Components

```typescript
// src/components/Shared/Badge.tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'reasoning' | 'tool' | 'open' | 'modality' | 'default'
  size?: 'sm' | 'md' | 'lg'
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]}`}>
      {children}
    </span>
  )
}

// src/components/Shared/CostDisplay.tsx
interface CostDisplayProps {
  cost: {
    input: number
    output: number
    cacheRead?: number | null
    cacheWrite?: number | null
  }
}

export function CostDisplay({ cost }: CostDisplayProps) {
  return (
    <div className={styles.costDisplay}>
      <span className={styles.costItem}>
        <span className={styles.label}>In:</span>
        <span className={styles.value}>${cost.input.toFixed(2)}/M</span>
      </span>
      <span className={styles.costItem}>
        <span className={styles.label}>Out:</span>
        <span className={styles.value}>${cost.output.toFixed(2)}/M</span>
      </span>
      {cost.cacheRead && (
        <span className={styles.costItem}>
          <span className={styles.label}>Cache:</span>
          <span className={styles.value}>${cost.cacheRead.toFixed(2)}/M</span>
        </span>
      )}
    </div>
  )
}
```

---

## 6. Routing Strategy

### 6.1 TanStack Router with Loaders

TanStack Router provides file-based routing with built-in support for server-side data fetching through loaders. This enables SSR data prefetching while maintaining client-side navigation.

**Route Definitions with Server Loaders:**

```typescript
// src/routes/__root.tsx
import { createFileRoute } from '@tanstack/react-router'
import { RouterProvider } from '@tanstack/react-router'
import { queryClient } from '@/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'

export const Route = createFileRoute('/__root')({
  component: RootLayout,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <RouterOutlet />
      </div>
    </QueryClientProvider>
  )
}
```

**Home Page with Loader and TanStack Query:**

```typescript
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels, type ModelsApiResponse } from '@/lib/models-api'
import { flattenModelsData, type FlattenedModel } from '@/lib/models-transform'
import { useQuery } from '@tanstack/react-query'
import { ModelList } from '@/components/ModelList'
import { FilterPanel } from '@/components/FilterPanel'

export const Route = createFileRoute('/')({
  component: IndexPage,
  loader: async () => {
    // Server-side: Fetch and transform data during SSR
    const rawData = await fetchModels()
    return {
      models: flattenModelsData(rawData),
    }
  },
})

function IndexPage() {
  const { models } = Route.useLoaderData()

  const { data: queryData } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const rawData = await fetchModels()
      return flattenModelsData(rawData)
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    initialData: models, // Use server-provided data
  })

  return (
    <div className="container mx-auto px-4 py-6">
      <FilterPanel />
      <ModelList models={queryData} />
    </div>
  )
}
```

**Model Detail Page with Dynamic Loader:**

```typescript
// src/routes/models.$modelId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'

export const Route = createFileRoute('/models/$modelId')({
  component: ModelDetailPage,
  loader: async ({ params }) => {
    // Fetch all models and find the specific one
    const rawData = await fetchModels()
    const allModels = flattenModelsData(rawData)
    const model = allModels.find((m) => m.id === params.modelId)

    if (!model) {
      throw new ErrorResponse(404, 'Model not found')
    }

    return { model }
  },
})

function ModelDetailPage() {
  const { model } = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">{model.modelName}</h1>
      <p className="text-gray-600">Provider: {model.providerName}</p>
      {/* Model details... */}
    </div>
  )
}
```

**Server Functions with TanStack Query (Alternative Pattern):**

For scenarios where you want to use server functions directly with TanStack Query:

```typescript
// src/lib/models-api.ts
import { createServerFn } from '@tanstack/react-start'

export const fetchModels = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await fetch('https://models.dev/api.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }
    return response.json()
  })

export const modelsQueryOptions = () =>
  queryOptions({
    queryKey: ['models'],
    queryFn: () => fetchModels(),
  })
```

```typescript
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels, modelsQueryOptions } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/')({
  component: IndexPage,
  loader: async ({ context }) => {
    // Server-side prefetch
    const rawData = await context.queryClient.ensureQueryData(modelsQueryOptions())
    return flattenModelsData(rawData)
  },
})

function IndexPage() {
  const models = useSuspenseQuery(modelsQueryOptions())

  return <ModelList models={models} />
}
```

### 6.2 Query Parameter Structure

**Home Page URL Structure:**

```
/?
  search={query}
  &providers={provider1},{provider2}
  &reasoning={true|false}
  &toolCall={true|false}
  &openWeights={true|false}
  &minCost={number}
  &maxCost={number}
  &dateFrom={YYYY-MM-DD}
  &dateTo={YYYY-MM-DD}
  &sort={name|provider|releaseDate|cost|context}
  &order={asc|desc}
```

**Example:**

```
/?search=gpt&providers=openai,anthropic&reasoning=true&sort=cost&order=desc
```

**Comparison URL Structure:**

```
/compare?models={modelId1},{modelId2},{modelId3},{modelId4}
```

**Example:**

```
/compare?models=gpt-4,claude-3-opus,kimi-k2,glm-4.5
```

### 6.3 Navigation Patterns

```typescript
// Update URL with new filter
function updateFilters(newFilters: FilterState) {
  const searchParams = filtersToSearchParams(newFilters)
  window.history.pushState({}, '', `/?${searchParams.toString()}`)
}

// Handle browser back/forward
useEffect(() => {
  const handlePopState = () => {
    const filters = searchParamsToFilters(
      new URLSearchParams(window.location.search),
    )
    setFilters((prev) => ({ ...prev, ...filters }))
  }

  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [])
```

### 6.4 SEO Considerations

```typescript
// Add to index page for SEO
export const head: MetaDescriptor = () => {
  return [
    { title: 'AI Models Explorer - Discover and Compare AI Models' },
    {
      name: 'description',
      content:
        'Browse and compare AI models from multiple providers. Filter by capabilities, cost, and release date. Find the perfect model for your needs.',
    },
    { property: 'og:title', content: 'AI Models Explorer' },
    {
      property: 'og:description',
      content: 'Discover and compare AI models from top providers',
    },
  ]
}
```

---

## 7. Performance Optimization

### 7.1 Virtual Scrolling

- Use `@tanstack/react-virtual` for model list
- Render only visible items + 5 item buffer
- Fixed-height cards for predictable calculations
- Virtualize horizontally for comparison table if needed

### 7.2 Code Splitting Strategy

```typescript
// Lazy load comparison modal
const ComparisonModal = lazy(() =>
  import('@/components/ComparisonModal/ComparisonModal').then((mod) => ({
    default: mod.ComparisonModal,
  })),
)

// Lazy load model detail page
const ModelDetailPage = lazy(() =>
  import('@/routes/models.$modelId').then((mod) => ({
    default: mod.ModelDetailPage,
  })),
)
```

### 7.3 Memoization Points

```typescript
// Memoize expensive computations
const filteredModels = useMemo(
  () => applyFilters(allModels, filters),
  [allModels, filters],
)

const sortedModels = useMemo(
  () => [...filteredModels].sort((a, b) => compareModels(a, b, sort)),
  [filteredModels, sort],
)

const visibleModels = useMemo(
  () => sortedModels.slice(0, PAGE_SIZE),
  [sortedModels],
)

// Memoize callback handlers
const handleModelSelect = useCallback(
  (model: FlattenedModel) => {
    toggleModel(model.id)
  },
  [toggleModel],
)
```

### 7.4 Lazy Loading Components

```typescript
// src/routes/__root.tsx
import { Suspense, lazy } from 'react'

const Header = lazy(() => import('@/components/Header'))
const ErrorBoundary = lazy(() => import('@/components/ErrorBoundary'))

export function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingBar />}>
        <Header />
        <main>
          <RouterOutlet />
        </main>
      </Suspense>
    </ErrorBoundary>
  )
}
```

### 7.5 Bundle Size Targets

| Chunk   | Target Size | Contents             |
| ------- | ----------- | -------------------- |
| main    | < 80KB      | Core app, routing    |
| vendors | < 60KB      | React, TanStack libs |
| table   | < 20KB      | TanStack Table       |
| virtual | < 15KB      | TanStack Virtual     |
| fuse    | < 10KB      | Fuse.js search       |

### 7.6 Image Optimization

```typescript
// Use lazy loading for all images
<img
  src={`/logos/${providerId}.png`}
  alt=""
  loading="lazy"
  decoding="async"
  width={32}
  height={32}
 />

// Use WebP format with fallbacks
<picture>
  <source srcset={`/logos/${id}.webp`} type="image/webp" />
  <img src={`/logos/${id}.png`} alt="" loading="lazy" />
</picture>
```

---

## 8. UI/UX Guidelines

### 8.1 Tailwind CSS v4 Styling Approach

This project uses Tailwind CSS v4, which introduces a new `@theme` directive for customizing the design system. The emphasis is on using Tailwind utility classes directly rather than creating custom CSS files.

**Global Styles with @theme inline:**

```css
/* src/styles.css */
@import 'tailwindcss';

@theme inline {
  /* Primary colors */
  --color-primary: #0ea5e9;
  --color-primary-hover: #0284c7;
  --color-primary-light: #e0f2fe;

  /* Semantic colors */
  --color-success: #10b981;
  --color-success-light: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-danger: #ef4444;
  --color-danger-light: #fee2e2;
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;

  /* Neutral colors */
  --color-bg: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary: #f3f4f6;
  --color-text: #111827;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-border-hover: #d1d5db;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}
```

**Leverage Tailwind Utility Classes:**

Instead of creating custom CSS files, use Tailwind's utility classes directly in components:

```tsx
// Example component with Tailwind utilities
export function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <img
          src={`/logos/${model.providerId}.png`}
          alt=""
          loading="lazy"
          className="h-8 w-8 rounded"
        />
        <div>
          <h3 className="font-semibold text-gray-900">{model.modelName}</h3>
          <span className="text-sm text-gray-500">{model.providerName}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {model.reasoning && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
            Reasoning
          </span>
        )}
        {model.toolCall && (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
            Tools
          </span>
        )}
      </div>
    </div>
  )
}
```

**Custom Color Usage with @theme:**

When using custom colors defined in @theme, use the `text-*`, `bg-*`, `border-*` utilities:

```tsx
// Using custom primary color
<button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded">
  Click me
</button>

// Using semantic colors
<div className="bg-success-light text-success p-4 rounded">
  Success message
</div>

// Using semantic danger colors
<div className="bg-danger-light text-danger p-4 rounded">
  Error message
</div>
```

**Why Tailwind Utility Classes Over Custom CSS:**

1. **Consistency:** Using utilities ensures consistent spacing, colors, and typography across components
2. **Performance:** Unused styles are automatically purged in production
3. **Maintainability:** No need to maintain multiple CSS files - everything is co-located with components
4. **Type Safety:** Tailwind v4 provides better TypeScript integration
5. **Developer Experience:** Faster development with autocomplete and preview in IDE

### 8.2 Component Spacing

```typescript
// Tailwind-like spacing scale
const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
}

// Container padding
.container-padding {
  padding: 0 var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}
```

### 8.3 Responsive Breakpoints

```typescript
// Breakpoint definitions
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// Usage with media queries
@media (min-width: 768px) {
  .filter-panel {
    display: block;
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 280px 1fr;
  }
}
```

### 8.4 Accessibility

**Keyboard Navigation:**

```typescript
// Ensure keyboard accessibility for all interactive elements
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveSelection('down')
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveSelection('up')
    }
  }}
>
  Filter Option
</button>
```

**ARIA Labels:**

```typescript
<input
  type="checkbox"
  checked={isSelected}
  onChange={onToggle}
  aria-label={`Select ${modelName} for comparison`}
/>

<button
  aria-label={`Remove ${modelName} from comparison`}
  onClick={() => removeModel(modelId)}
>
  <Icon name="close" />
</button>
```

**Focus Management:**

```typescript
// Focus trap in modal
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus()
    }
  }, [isOpen])

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleTabKey}
    >
      {children}
    </div>
  )
}
```

### 8.5 Loading States

```typescript
// Skeleton loading component
function ModelCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.skeleton} style={{ width: '20px', height: '20px' }} />
      <div className={styles.skeleton} style={{ width: '60%', height: '24px' }} />
      <div className={styles.skeleton} style={{ width: '40%', height: '16px' }} />
      <div className={styles.skeleton} style={{ width: '80%', height: '80px' }} />
    </div>
  )
}

// Page loading state
function LoadingPage() {
  return (
    <div className={styles.loadingPage}>
      <LoadingSpinner size="lg" />
      <p>Loading models...</p>
    </div>
  )
}
```

### 8.6 Empty States

```typescript
// Empty filter results
function EmptyFiltersState({ onClear }: { onClear: () => void }) {
  return (
    <div className={styles.emptyState}>
      <Icon name="search" size="xl" />
      <h3>No models found</h3>
      <p>Try adjusting your filters or search terms</p>
      <button onClick={onClear}>Clear all filters</button>
    </div>
  )
}

// No search results
function EmptySearchState({ query }: { query: string }) {
  return (
    <div className={styles.emptyState}>
      <Icon name="magnify" size="xl" />
      <h3>No results for "{query}"</h3>
      <p>Try searching for a different model or provider</p>
    </div>
  )
}
```

---

## 9. Error Handling

### 9.1 API Fetch Errors

```typescript
// Error boundary component
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div className={styles.errorPage}>
        <h1>{error.status}</h1>
        <p>{error.data}</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    )
  }

  return <>{children}</>
}

// Query error handling
function useModelsQuery() {
  return useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const rawData = await fetchModels()
      return flattenModelsData(rawData)
    },
    retry: 3,
    throwOnError: false,
    meta: {
      onError: (error: Error) => {
        console.error('Failed to fetch models:', error)
        // Optionally send to error tracking service
      },
    },
  })
}
```

### 9.2 Data Validation

```typescript
// Zod schema for API response validation
import { z } from 'zod'

const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  family: z.string(),
  attachment: z.boolean(),
  reasoning: z.boolean(),
  tool_call: z.boolean(),
  temperature: z.boolean(),
  knowledge: z.string(),
  release_date: z.string(),
  last_updated: z.string(),
  modalities: z.object({
    input: z.array(z.string()),
    output: z.array(z.string()),
  }),
  open_weights: z.boolean(),
  cost: z.object({
    input: z.number(),
    output: z.number(),
    cache_read: z.number().optional(),
    cache_write: z.number().optional(),
  }),
  limit: z.object({
    context: z.number(),
    output: z.number(),
  }),
})

const ProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  env: z.array(z.string()),
  npm: z.string(),
  api: z.string(),
  doc: z.string(),
  models: z.record(z.string(), ModelSchema),
})

const ApiResponseSchema = z.record(z.string(), ProviderSchema)

export function validateApiResponse(data: unknown): ApiResponse | null {
  try {
    return ApiResponseSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API response validation failed:', error.errors)
    }
    return null
  }
}
```

### 9.3 Search/Filter Edge Cases

```typescript
// Handle empty search results gracefully
function SearchResults({ query, results, onClear }) {
  if (!query) {
    return null
  }

  if (results.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No models found matching "{query}"</p>
        <button onClick={onClear}>Clear search</button>
      </div>
    )
  }

  return <div>{results.length} results</div>
}

// Handle filter combinations
function getFilterSummary(filters: FilterState): string {
  const parts: string[] = []

  if (filters.providers.length > 0) {
    parts.push(`${filters.providers.length} providers`)
  }

  if (filters.capabilities.reasoning) {
    parts.push('reasoning-capable')
  }

  if (filters.costRange.max !== null) {
    parts.push(`under $${filters.costRange.max}/M`)
  }

  if (parts.length === 0) {
    return 'All models'
  }

  return parts.join(', ')
}
```

### 9.4 Error Boundary Setup

```typescript
// src/routes/__root.tsx
import { ErrorBoundary } from '@tanstack/react-router'

export function App() {
  return (
    <ErrorBoundary
      errorComponent={({ error, reset }) => (
        <div className={styles.errorContainer}>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Try again</button>
        </div>
      )}
    >
      <RouterOutlet />
    </ErrorBoundary>
  )
}
```

---

## 10. Testing Strategy

### 10.1 Unit Test Coverage

```typescript
// src/lib/__tests__/models-filters.test.ts
import { describe, it, expect } from 'vitest'
import { applyFilters } from '../models-filters'
import type { FilterState } from '@/types/models'

const mockModels = [
  {
    id: 'openai/gpt-4',
    providerId: 'openai',
    providerName: 'OpenAI',
    modelName: 'GPT-4',
    reasoning: true,
    toolCall: true,
    openWeights: false,
    cost: { input: 30, output: 60 },
    releaseDate: '2023-03-14',
  },
  {
    id: 'anthropic/claude-3-opus',
    providerId: 'anthropic',
    providerName: 'Anthropic',
    modelName: 'Claude 3 Opus',
    reasoning: true,
    toolCall: true,
    openWeights: false,
    cost: { input: 15, output: 75 },
    releaseDate: '2024-02-29',
  },
]

describe('applyFilters', () => {
  it('filters by provider', () => {
    const filters: FilterState = {
      ...defaultFilters,
      providers: ['openai'],
    }

    const result = applyFilters(mockModels, filters)

    expect(result).toHaveLength(1)
    expect(result[0].providerId).toBe('openai')
  })

  it('filters by reasoning capability', () => {
    const filters: FilterState = {
      ...defaultFilters,
      capabilities: {
        ...defaultFilters.capabilities,
        reasoning: true,
      },
    }

    const result = applyFilters(mockModels, filters)

    expect(result).toHaveLength(2)
    expect(result.every((m) => m.reasoning)).toBe(true)
  })

  it('filters by cost range', () => {
    const filters: FilterState = {
      ...defaultFilters,
      costRange: { min: 0, max: 50 },
    }

    const result = applyFilters(mockModels, filters)

    expect(result).toHaveLength(1)
    expect(result[0].modelName).toBe('GPT-4')
  })
})
```

### 10.2 Component Testing

```typescript
// src/components/ModelCard/__tests__/ModelCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ModelCard } from '../ModelCard'

const mockModel = {
  id: 'openai/gpt-4',
  providerId: 'openai',
  providerName: 'OpenAI',
  modelName: 'GPT-4',
  reasoning: true,
  toolCall: true,
  openWeights: false,
  cost: { input: 30, output: 60 },
  releaseDate: '2023-03-14',
}

describe('ModelCard', () => {
  it('renders model name and provider', () => {
    render(<ModelCard model={mockModel} isSelected={false} onSelect={() => {}} />)

    expect(screen.getByText('GPT-4')).toBeInTheDocument()
    expect(screen.getByText('OpenAI')).toBeInTheDocument()
  })

  it('shows capability badges', () => {
    render(<ModelCard model={mockModel} isSelected={false} onSelect={() => {}} />)

    expect(screen.getByText('Reasoning')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
  })

  it('calls onSelect when checkbox is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<ModelCard model={mockModel} isSelected={false} onSelect={onSelect} />)

    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('displays cost correctly', () => {
    render(<ModelCard model={mockModel} isSelected={false} onSelect={() => {}} />)

    expect(screen.getByText('$30.00/M')).toBeInTheDocument()
    expect(screen.getByText('$60.00/M')).toBeInTheDocument()
  })
})
```

### 10.3 Integration Testing

```typescript
// src/routes/__tests__/index.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory } from '@tanstack/react-router'
import { RouterProvider } from '@tanstack/react-router'
import { IndexPage } from '../index'

// Mock API response
const mockApiResponse = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    env: ['OPENAI_API_KEY'],
    npm: '@openai/api',
    api: 'https://api.openai.com',
    doc: 'https://platform.openai.com/docs',
    models: {
      'gpt-4': {
        id: 'gpt-4',
        name: 'GPT-4',
        family: 'gpt-4',
        attachment: false,
        reasoning: true,
        tool_call: true,
        temperature: true,
        knowledge: '2023-12',
        release_date: '2023-03-14',
        last_updated: '2024-06-01',
        modalities: { input: ['text', 'image'], output: ['text'] },
        open_weights: false,
        cost: { input: 30, output: 60 },
        limit: { context: 128000, output: 4096 },
      },
    },
  },
}

describe('IndexPage', () => {
  it('renders model list after data loads', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    })

    render(<IndexPage />)

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Should show models after load
    await waitFor(() => {
      expect(screen.getByText('GPT-4')).toBeInTheDocument()
    })
  })

  it('filters models when provider filter is selected', async () => {
    // Setup with mock data
    // Test filter interaction
  })

  it('opens comparison modal when 2+ models selected', async () => {
    // Setup with mock data
    // Select multiple models
    // Verify modal opens
  })
})
```

### 10.4 E2E Testing Approach

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
})
```

```typescript
// e2e/model-explorer.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Model Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads and displays models', async ({ page }) => {
    await expect(page.locator('text=Loading')).toBeVisible()

    await expect(page.locator('text=GPT-4')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Claude')).toBeVisible()
  })

  test('filters models by provider', async ({ page }) => {
    // Wait for models to load
    await expect(page.locator('text=GPT-4')).toBeVisible({ timeout: 10000 })

    // Click OpenAI filter
    await page.click('label:has-text("OpenAI")')

    // Verify only OpenAI models shown
    await expect(page.locator('text=GPT-4')).toBeVisible()
    await expect(page.locator('text=Claude')).not.toBeVisible()
  })

  test('searches models by name', async ({ page }) => {
    await expect(page.locator('text=GPT-4')).toBeVisible({ timeout: 10000 })

    // Type in search box
    await page.fill('input[aria-label="Search models"]', 'claude')

    // Verify search results
    await expect(page.locator('text=GPT-4')).not.toBeVisible()
    await expect(page.locator('text=Claude')).toBeVisible()
  })

  test('comparison mode with 4 models', async ({ page }) => {
    // Select 4 models
    await page.click('input[aria-label*="GPT-4"]:near(:text("GPT-4"))')
    await page.click('input[aria-label*="Claude"]:near(:text("Claude"))')
    await page.click('input[aria-label*="Gemini"]:near(:text("Gemini"))')
    await page.click('input[aria-label*="Kimi"]:near(:text("Kimi"))')

    // Open comparison
    await page.click('button:has-text("Compare")')

    // Verify comparison modal opens
    await expect(page.locator('text=Compare Models')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })
})
```

### 10.5 Performance Testing

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('LCP under 1.5s', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/', { waitUntil: 'networkidle' })

    // Wait for largest contentful paint
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              resolve(entry.startTime)
            }
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })
      })
    })

    expect(lcp).toBeLessThan(1500)
  })

  test('interaction response under 100ms', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=GPT-4')).toBeVisible({ timeout: 10000 })

    // Measure filter interaction
    const filterStart = Date.now()
    await page.click('label:has-text("OpenAI")')
    const filterEnd = Date.now()

    expect(filterEnd - filterStart).toBeLessThan(100)
  })

  test('scroll remains smooth with 500+ items', async ({ page }) => {
    // Load page with many models
    await page.goto('/')
    await expect(page.locator('text=GPT-4')).toBeVisible({ timeout: 10000 })

    // Scroll down and measure frame rate
    const frameDrops = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let drops = 0
        let lastTime = performance.now()

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'frame') {
              const now = entry.startTime
              if (now - lastTime > 20) {
                drops++
              }
              lastTime = now
            }
          }
        }).observe({ type: 'frame', buffered: true })

        // Scroll for 2 seconds
        setTimeout(() => resolve(drops), 2000)
      })
    })

    expect(frameDrops).toBeLessThan(5)
  })
})
```

---

## 11. Implementation Phases

### 11.1 Phase 1: Foundation (Week 1)

**Deliverables:**

1. Project Setup
   - Install additional dependencies (`@tanstack/react-virtual`, `@tanstack/react-table`, `fuse.js`)
   - Configure TypeScript paths and types
   - Set up linting and formatting

2. API Integration
   - Implement `fetchModelsData()` function
   - Set up TanStack Query with 24h staleTime
   - Create data transformation pipeline
   - Add API response validation with Zod

3. TypeScript Types
   - Define `Provider`, `Model`, `FlattenedModel` types
   - Define `FilterState` and `SortState` types
   - Create type guards and validation

4. Basic Layout
   - Create `__root.tsx` layout with header
   - Set up main grid layout (filters + list)
   - Implement responsive breakpoints

**Acceptance Criteria:**

- [ ] API fetches and caches data correctly
- [ ] Data transforms to flattened structure
- [ ] TypeScript compilation succeeds with no errors
- [ ] Basic layout renders on all screen sizes

### 11.2 Phase 2: Filtering (Week 2)

**Deliverables:**

1. Filter System
   - Create `FilterPanel` component
   - Implement provider multi-select filter
   - Implement capability toggle filters
   - Implement cost range slider
   - Implement date range picker

2. URL State Sync
   - Implement `filtersToSearchParams()`
   - Implement `searchParamsToFilters()`
   - Handle browser back/forward navigation
   - Sync filters to URL on change

3. Filter Logic
   - Implement `applyFilters()` function
   - Support filter combinations
   - Add filter summary display
   - Implement "Clear all filters" functionality

**Acceptance Criteria:**

- [ ] All filter types work correctly
- [ ] Filters persist in URL
- [ ] Browser back/forward works with filters
- [ ] Filter combinations work as expected

### 11.3 Phase 3: Advanced Features (Week 3)

**Deliverables:**

1. Search System
   - Implement `SearchBar` component with debouncing
   - Set up Fuse.js search index
   - Search only provider and model names
   - Add search result highlighting
   - Show "No results" state

2. Comparison Mode
   - Implement model selection (checkboxes)
   - Limit selection to 4 models
   - Create comparison modal/panel
   - Implement side-by-side comparison table
   - Highlight differences between models
   - Add share via URL functionality

3. Model Detail Page
   - Create `/models/:modelId` route
   - Display full model specifications
   - Add "Related models" section
   - Implement deep linking

**Acceptance Criteria:**

- [ ] Search finds models and providers
- [ ] Comparison modal shows 2-4 models side-by-side
- [ ] Differences are highlighted
- [ ] Share URL copies to clipboard correctly
- [ ] Model detail page displays all specifications

### 11.4 Phase 4: Polish & Optimization (Week 4)

**Deliverances:**

1. Performance Optimization
   - Implement virtual scrolling for model list
   - Add code splitting for heavy components
   - Memoize expensive computations
   - Optimize bundle size

2. UI/UX Polish
   - Add skeleton loading states
   - Implement error boundaries
   - Add empty states
   - Improve accessibility (ARIA, keyboard nav)
   - Add animations and transitions

3. Testing
   - Unit tests for filter logic (80% coverage)
   - Component tests for major components
   - E2E tests for critical paths
   - Performance tests

4. Documentation
   - Update README with new features
   - Add inline code documentation
   - Create API documentation

**Acceptance Criteria:**

- [ ] LCP under 1.5s
- [ ] 80% test coverage
- [ ] All interactive elements keyboard accessible
- [ ] Smooth animations (60fps)
- [ ] Error states display correctly

---

## 12. Success Criteria

### 12.1 Performance Targets

| Metric      | Target          | Measurement      |
| ----------- | --------------- | ---------------- |
| LCP         | < 1.5s          | Lighthouse (P75) |
| FCP         | < 800ms         | Lighthouse (P75) |
| TTI         | < 2s            | Lighthouse (P75) |
| CLS         | 0               | Lighthouse (P75) |
| FID         | < 100ms         | Lighthouse (P75) |
| Bundle Size | < 200KB gzipped | Lighthouse       |
| First Paint | < 400ms         | WebPageTest      |

### 12.2 User Experience Goals

**Task Completion:**

- [ ] Users can find a specific model by name in < 3 seconds
- [ ] Users can filter to 5 or fewer models in < 5 seconds
- [ ] Users can compare 2-4 models in < 10 seconds
- [ ] Users can share a comparison in < 5 seconds

**User Satisfaction:**

- [ ] Zero confusion about how to use filters
- [ ] Clear visual feedback for all interactions
- [ ] Responsive design works on mobile devices
- [ ] Accessible to keyboard-only users

### 12.3 Feature Completeness Checklist

**Core Features:**

- [ ] Model list displays all models from API
- [ ] Search by model name and provider name
- [ ] Filter by provider
- [ ] Filter by capabilities (reasoning, tools, open weights)
- [ ] Filter by cost range
- [ ] Filter by release date
- [ ] Sort by name, provider, cost, date
- [ ] Select models for comparison (max 4)
- [ ] View side-by-side comparison
- [ ] Highlight differences in comparison
- [ ] Share comparison via URL

**Technical Requirements:**

- [ ] Data refreshes every 24 hours
- [ ] No authentication required
- [ ] Filters persist in URL
- [ ] Bookmarks saved to localStorage
- [ ] Works offline (after initial load)
- [ ] Responsive design (mobile, tablet, desktop)

**Quality Requirements:**

- [ ] 80% unit test coverage
- [ ] All components tested
- [ ] E2E tests for critical paths
- [ ] Accessibility score of 100
- [ ] TypeScript strict mode enabled
- [ ] No console errors in production

---

## Appendix A: TypeScript Types

```typescript
// src/types/models.ts

// API Response Types
export interface ApiResponse {
  [providerId: string]: Provider
}

export interface Provider {
  id: string
  name: string
  env: string[]
  npm: string
  api: string
  doc: string
  models: {
    [modelId: string]: Model
  }
}

export interface Model {
  id: string
  name: string
  family: string
  attachment: boolean
  reasoning: boolean
  tool_call: boolean
  temperature: boolean
  knowledge: string // YYYY-MM format
  release_date: string // YYYY-MM-DD format
  last_updated: string // YYYY-MM-DD format
  modalities: {
    input: string[]
    output: string[]
  }
  open_weights: boolean
  cost: {
    input: number // dollars per 1M tokens
    output: number // dollars per 1M tokens
    cache_read?: number
    cache_write?: number
  }
  limit: {
    context: number // max context tokens
    output: number // max output tokens
  }
}

// Flattened Model (for easier processing)
export interface FlattenedModel {
  // Composite ID
  id: string
  // Provider info
  providerId: string
  providerName: string
  // Model info
  modelId: string
  modelName: string
  family: string
  // Capabilities
  attachment: boolean
  reasoning: boolean
  toolCall: boolean
  temperature: boolean
  // Dates
  knowledgeDate: string
  releaseDate: string
  lastUpdated: string
  // Modalities
  inputModalities: string[]
  outputModalities: string[]
  // Access
  openWeights: boolean
  // Costs
  cost: {
    input: number
    output: number
    cacheRead: number | null
    cacheWrite: number | null
  }
  // Limits
  limits: {
    context: number
    output: number
  }
  // Metadata
  npm: string
  apiEndpoint: string
  documentation: string
  environment: string[]
}

// Filter Types
export interface FilterState {
  providers: string[]
  capabilities: {
    reasoning: boolean | null
    toolCall: boolean | null
    openWeights: boolean | null
  }
  costRange: {
    min: number
    max: number | null
  }
  dateRange: {
    start: string | null // YYYY-MM-DD
    end: string | null // YYYY-MM-DD
  }
  modalities: {
    input: string[]
    output: string[]
  }
}

export const defaultFilters: FilterState = {
  providers: [],
  capabilities: {
    reasoning: null,
    toolCall: null,
    openWeights: null,
  },
  costRange: {
    min: 0,
    max: null,
  },
  dateRange: {
    start: null,
    end: null,
  },
  modalities: {
    input: [],
    output: [],
  },
}

// Sort Types
export type SortField = 'name' | 'provider' | 'releaseDate' | 'cost' | 'context'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

// Comparison Types
export interface ComparisonState {
  selectedIds: string[]
  maxSelection: 4
}

// Search Types
export interface SearchResult {
  item: FlattenedModel
  score: number
  matches: Fuse.FuseResultMatch[]
}
```

---

## Appendix B: File Structure

```
src/
├── components/
│   ├── ModelList/
│   │   ├── ModelList.tsx
│   │   ├── ModelCard.tsx
│   │   ├── VirtualListContainer.tsx
│   │   ├── SkeletonCard.tsx
│   │   └── index.ts
│   ├── FilterPanel/
│   │   ├── FilterPanel.tsx
│   │   ├── ProviderFilter.tsx
│   │   ├── CapabilityFilter.tsx
│   │   ├── CostRangeFilter.tsx
│   │   ├── DateRangeFilter.tsx
│   │   ├── ModalitiesFilter.tsx
│   │   └── index.ts
│   ├── SearchBar/
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   ├── ComparisonModal/
│   │   ├── ComparisonModal.tsx
│   │   ├── ComparisonTable.tsx
│   │   ├── ComparisonRow.tsx
│   │   ├── ShareButton.tsx
│   │   └── index.ts
│   ├── Shared/
│   │   ├── Badge.tsx
│   │   ├── CostDisplay.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── index.ts
│   ├── Header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx
│       ├── ErrorFallback.tsx
│       └── index.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── compare.tsx
│   └── models.$modelId.tsx
├── lib/
│   ├── models-api.ts
│   ├── models-transform.ts
│   ├── models-filters.ts
│   ├── models-search.ts
│   ├── url-state.ts
│   └── query-client.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useComparison.ts
├── utils/
│   ├── cost.ts
│   ├── format.ts
│   └── comparison.ts
├── types/
│   └── models.ts
├── data/
│   └── sample-models.ts
├── styles/
│   └── styles.css
└── router.tsx
```

---

## Appendix C: API Reference

### Server Functions (TanStack Start)

This project uses TanStack Start's `createServerFn` pattern for type-safe server-side data fetching. This replaces the traditional REST API endpoint approach with a more modern, type-safe server function pattern.

#### Server Function Pattern

Server functions are defined using `createServerFn` and can be called directly from both server-side loaders and client-side code:

```typescript
// src/lib/models-api.ts
import { createServerFn } from '@tanstack/react-start'

export interface ModelsApiResponse {
  [providerId: string]: {
    id: string
    name: string
    env: string[]
    npm: string
    api: string
    doc: string
    models: {
      [modelId: string]: {
        id: string
        name: string
        family: string
        attachment: boolean
        reasoning: boolean
        tool_call: boolean
        temperature: boolean
        knowledge: string
        release_date: string
        last_updated: string
        modalities: {
          input: string[]
          output: string[]
        }
        open_weights: boolean
        cost: {
          input: number
          output: number
          cache_read?: number
          cache_write?: number
        }
        limit: {
          context: number
          output: number
        }
      }
    }
  }
}

export const fetchModels = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await fetch('https://models.dev/api.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json() as Promise<ModelsApiResponse>
  })
```

#### Usage in Route Loaders (SSR)

```typescript
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'

export const Route = createFileRoute('/')({
  component: IndexPage,
  loader: async () => {
    // Server-side: Fetch and transform data during SSR
    const rawData = await fetchModels()
    return {
      models: flattenModelsData(rawData),
    }
  },
})
```

#### Usage with TanStack Query (Client-side)

```typescript
// In route level
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const modelsQueryOptions = () =>
  queryOptions({
    queryKey: ['models'],
    queryFn: () => fetchModels(),
  })

export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(modelsQueryOptions())
  },
  component: PostsComponent,
})

function PostsComponent() {
  const modelsQuery = useSuspenseQuery(modelsQueryOptions())
}

// In a component
const { data: models } = useQuery({
  queryKey: ['models'],
  queryFn: async () => {
    const rawData = await fetchModels()
    return flattenModelsData(rawData)
  },
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
})
```

#### Why Server Functions Over REST Endpoints

1. **Type Safety**: End-to-end type safety without generating API types
2. **No Manual HTTP**: Direct function calls instead of fetch/Axios
3. **SSR Integration**: Seamlessly use in loaders for SSR data prefetching
4. **Client Hydration**: Easy integration with TanStack Query's initialData
5. **Server/Client Unification**: Same code runs on server and client

#### API Response Format

The server function fetches data from models.dev API and returns the same structure:

```json
{
  "providerId": {
    "id": "providerId",
    "name": "Provider Name",
    "env": ["ENV_VAR"],
    "npm": "@provider/package",
    "api": "https://api.provider.com",
    "doc": "https://docs.provider.com",
    "models": {
      "modelId": {
        "id": "modelId",
        "name": "Model Name",
        "family": "model-family",
        "attachment": false,
        "reasoning": true,
        "tool_call": true,
        "temperature": true,
        "knowledge": "2023-12",
        "release_date": "2023-03-14",
        "last_updated": "2024-06-01",
        "modalities": {
          "input": ["text", "image"],
          "output": ["text"]
        },
        "open_weights": false,
        "cost": {
          "input": 30,
          "output": 60,
          "cache_read": 1,
          "cache_write": 2
        },
        "limit": {
          "context": 128000,
          "output": 4096
        }
      }
    }
  }
}
```

---

**Document Version History**

| Version | Date       | Author           | Changes                                                                                                                                                                                                                                                                                                                                  |
| ------- | ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-28 | Technical Writer | Initial specification                                                                                                                                                                                                                                                                                                                    |
| 1.1.0   | 2025-12-28 | Technical Writer | - Removed custom cache manager - use TanStack Query's built-in caching<br>- Updated to Tailwind CSS v4 with @theme inline<br>- Added TanStack Start server functions (createServerFn)<br>- Updated routing with loaders for SSR<br>- Emphasized full TanStack ecosystem integration<br>- Updated architecture diagrams and code examples |
| 1.3.0   | 2025-12-28 | Senior Engineer  | - Updated all `createServerFn` examples to use the correct TanStack Start pattern: `createServerFn({ method: 'GET' }).handler(async () => { })` instead of deprecated `createServerFn('GET', async () => { })`                                                                                                                           |
| 1.2.0   | 2025-12-28 | Senior Engineer  | - Moved hooks/ and utils/ to root level (src/hooks/, src/utils/)<br>- Removed entry files (App.tsx, main.tsx, entry-client.tsx, entry-server.tsx)<br>- Updated file structure for TanStack Start architecture<br>- Updated Appendix C API Reference to explain createServerFn pattern instead of REST endpoints                          |

---

_End of Technical Specification Document_
