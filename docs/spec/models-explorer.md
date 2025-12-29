# AI Models Explorer - Technical Specification Document

**Version:** 2.1.0
**Last Updated:** 2025-12-29
**Status:** Draft
**Project:** Models Explorer (models.dev alternative)

---

**Changelog (v2.1.0):**

- Updated to server-side architecture (Phase 3.5)
- Added `manualPagination: true` and `manualFiltering: true` patterns
- Documented Fuse.js fuzzy search integration
- Added data flow diagrams for server-side operations
- Added section 4.1.1: Server-Side Pagination, Search, and Filtering

---

## 1. Executive Summary

### 1.1 Project Overview

The AI Models Explorer is a web application that provides a comprehensive, performant interface for browsing and comparing AI models from various providers. The application serves as an enhanced alternative to models.dev, featuring **server-side pagination, filtering, and fuzzy search** via a dedicated Phase 3.5 API layer, offering improved user experience, advanced filtering capabilities, side-by-side model comparison, and seamless data synchronization with the models.dev API.

The platform aggregates AI model information from multiple providers into a single, searchable interface. Users can filter models by various attributes such as capabilities (reasoning, tool calling), cost, release date, and supported modalities. The comparison feature allows users to select up to four models and view their specifications side-by-side with highlighted differences.

### 1.2 Goals and Objectives

**Primary Goals:**

1. **Performance Excellence:** Achieve sub-second load times and 60fps interactions through server-side pagination that only fetches needed data (configurable page size, default 50 models per page)
2. **User Empowerment:** Enable users to quickly find and compare models using intuitive filters and server-side fuzzy search
3. **Data Accuracy:** Ensure model information is always current with automated 24-hour refresh cycles
4. **Accessibility:** Create an inclusive interface that works for all users regardless of device or ability
5. **Scalability:** Support large model datasets through server-side operations, eliminating client-side memory constraints

**Secondary Objectives:**

- Minimize bundle size to under 200KB gzipped for initial load
- Achieve 100% TypeScript coverage for all data structures
- Maintain zero layout shift during data loading
- Support all modern browsers (Chrome, Firefox, Safari, Edge)

### 1.3 TanStack Ecosystem Integration

This project leverages the full TanStack ecosystem for a cohesive, type-safe development experience:

| Library              | Purpose                 | Benefits                                               |
| -------------------- | ----------------------- | ------------------------------------------------------ |
| **TanStack Start**   | Full-stack framework    | SSR, server functions, file-based routing              |
| **TanStack Router**  | Type-safe routing       | File-based routes, search params, middleware           |
| **TanStack Query**   | Data fetching & caching | Built-in caching, background refetch, deduping         |
| **TanStack Virtual** | Virtual scrolling       | Efficient rendering of large lists (500+ items)        |
| **TanStack Table**   | Data tables             | Headless UI for main models list AND comparison tables |

**Why the TanStack Ecosystem:**

1. **Cohesive Tooling:** All libraries share similar APIs, patterns, and TypeScript support
2. **Type Safety:** End-to-end type safety from server to client
3. **Performance:** Optimized for performance with minimal bundle size
4. **Developer Experience:** Excellent DevTools, debugging, and monitoring
5. **Community:** Active maintenance and large community support

### 1.4 Success Metrics

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
│  │              TanStack Table (Server-Side Data)             │  │
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
│  ┌───────────────────────────────────────────────────────────┐  │
│  │         Phase 3.5 Server API (src/lib/api/models.ts)       │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │  │
│  │  │ getModels  │  │  Fuse.js   │  │   Pagination &     │   │  │
│  │  │  ServerFn  │  │  Search    │  │   Filtering        │   │  │
│  │  └────────────┘  └────────────┘  └────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
1. Initial Load (SSR + Hydration):
   ┌──────────┐     ┌──────────────────┐     ┌─────────────────┐
   │  loader  │────▶│  getModels       │────▶│  models.dev     │
   │ (server) │     │  (Phase 3.5 API) │     │  /api.json      │
   └──────────┘     └──────────────────┘     └─────────────────┘
        │                                        │
        │  { data: [...], pagination: {...} }    │
        │◀───────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Server-Side Data Processing                  │
   │  - Load and flatten models data              │
   │  - Apply Fuse.js fuzzy search (if query)     │
   │  - Apply filters (providers, capabilities)   │
   │  - Paginate results                          │
   │  - Return { data, pagination }               │
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
   │  - TanStack Table renders paginated data     │
   │  - Shows pagination controls                 │
   │  - Displays filter status                    │
   └──────────────────────────────────────────────┘

2. User Interaction with TanStack Table (Server-Side Mode):
   ┌──────────┐     ┌──────────────┐     ┌─────────────────┐
   │ Filter/  │────▶│ TanStack     │────▶│ URL Update      │
   │ Sort/    │     │ Table State  │     │ (pushState)     │
   │ Paginate │     │              │     │                 │
   └──────────┘     └──────────────┘     └─────────────────┘
        │                     │
        │  TanStack Table     │
        │  manages UI state   │
        │◀────────────────────┘
        │
        │  onPaginationChange / onColumnFiltersChange / onGlobalFilterChange
        ▼
   ┌──────────────────────────────────────────────┐
   │  TanStack Query Trigger                       │
   │  - queryKey includes: pagination, filters    │
   │  - Fetch new data from Phase 3.5 API         │
   │  - Returns { data: [...], pagination: {...}} │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Phase 3.5 Server API Processing              │
   │  1. Load cached models data                   │
   │  2. Apply Fuse.js fuzzy search (if search)    │
   │  3. Apply column filters (providers, etc.)    │
   │  4. Paginate filtered results                 │
   │  5. Return page data + total count            │
   └──────────────────────────────────────────────┘
        │
        ▼
   ┌──────────────────────────────────────────────┐
   │  Table State                                  │
   │  - pagination (pageIndex, pageSize)           │
   │  - globalFilter (search query)                │
   │  - columnFilters (provider, reasoning, etc.)  │
   │  - sorting (sort column + direction)          │
   │  - columnVisibility (show/hide columns)       │
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

````typescript
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
          reasoning?: number
          input_audio?: number
          output_audio?: number
        }
        limit: {
          context: number
          input?: number
          output: number
        }
        structured_output?: boolean
      }
    }
  }
}

export const fetchModels = createServerFn({ method: 'GET' }).handler(
  async () => {
    const response = await fetch('https://models.dev/api.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json() as Promise<ModelsApiResponse>
  },
)

**Phase 3.5 Server API (src/lib/api/models.ts):**

For server-side pagination, filtering, and fuzzy search, the project implements `getModels` server function. This API provides:

| Feature | Description |
| ------- | ----------- |
| **Pagination** | `page` (1-based) and `limit` parameters |
| **Fuzzy Search** | Fuse.js integration with configurable keys and thresholds |
| **Filtering** | Provider filter, reasoning, toolCall, structuredOutput |
| **Caching** | In-memory cache with 24-hour TTL |
| **Response** | `{ data: FlattenedModel[], pagination: {...} }` |

```typescript
// src/lib/api/models.ts
export const getModels = createServerFn({ method: 'GET' })
  .inputValidator(GetModelsSchema)
  .handler(async ({ data }) => {
    // 1. Load models (cached or fresh from models.dev)
    const allModels = await loadModelsData()

    // 2. Apply search (Fuse.js fuzzy search)
    const filteredModels = applyFilters(allModels, data)

    // 3. Apply pagination
    const { paginated, meta } = applyPagination(filteredModels, data.page, data.limit)

    return { data: paginated, pagination: meta }
  })

// Query options for TanStack Query
export const modelsQueryOptions = (params: GetModelsInput) =>
  queryOptions({
    queryKey: ['models', params],
    queryFn: () => getModels({ data: params }),
    staleTime: 24 * 60 * 60 * 1000,
  })
````

**Benefits of Phase 3.5 Server API:**

1. **Reduced Initial Load:** Only fetch the first page (default 50 models) instead of all 500+
2. **Fuzzy Search:** Fuse.js provides intelligent matching beyond simple substring
3. **Scalability:** Server handles filtering/pagination, not client memory
4. **Consistent Performance:** Query time remains stable regardless of dataset size

**Key Considerations:**

1. **Pagination from API:** The API returns paginated data with metadata (total, pages, hasMore)
2. **Background Refresh:** Cache automatically refetches after 24 hours
3. **Debounced Search:** Search input should be debounced (300ms) to prevent excessive API calls
4. **SSR Integration:** Use `initialData` from server loader to hydrate TanStack Query cache
5. **Error Handling:** Graceful degradation with retry logic and error boundaries

```typescript
// src/routes/__root.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

// No need to create a new QueryClient - import and use the existing one
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
    </QueryClientProvider>
  )
}
```

**Why TanStack Query's Built-in Caching is Sufficient:**

1. **Industry Standard:** TanStack Query is the de facto standard for React data fetching, used by thousands of production applications
2. **Memory Efficient:** Automatic garbage collection based on `gcTime` prevents memory leaks
3. **Smart Refetching:** Built-in strategies for background refetching, deduping, and stale-while-revalidate
4. **No Custom Code:** Eliminates the need for custom cache management, reducing bugs and maintenance
5. **DevTools Integration:** Built-in DevTools for cache inspection and debugging

**Key Considerations:**

1. **Pagination from API:** Phase 3.5 server API provides paginated data with configurable page size (default 50)
2. **Background Refresh:** Data automatically refetches when cache expires (when user returns to app after 24h)
3. **Error Handling:** Graceful degradation with retry logic and error boundaries
4. **Loading States:** Skeleton screens during initial fetch, instant loads after cache
5. **SSR Integration:** Use `initialData` from server loader to hydrate TanStack Query cache
6. **Debouncing:** Search input should be debounced (300ms) to prevent excessive API calls

### 3.2 Data Transformation

The API returns nested provider/model structure. Flatten for easier processing with TanStack Table:

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
        structuredOutput: model.structured_output,
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
          reasoning: model.cost.reasoning ?? null,
          audioInput: model.cost.input_audio ?? null,
          audioOutput: model.cost.output_audio ?? null,
        },
        // Limits
        limits: {
          context: model.limit.context,
          input: model.limit.input ?? null,
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

**Server-Side Fuzzy Search with Fuse.js:**

The application uses **Fuse.js on the server** for fuzzy search, integrated with TanStack Table's `globalFilter` for UI state management. This provides intelligent, typo-tolerant search while keeping the search logic on the server.

```typescript
// src/lib/api/models.ts
function getFuseInstance(models: Array<FlattenedModel>): Fuse<FlattenedModel> {
  return new Fuse(models, {
    keys: [
      { name: 'modelName', weight: 2.0 },
      { name: 'providerName', weight: 1.5 },
      { name: 'modelFamily', weight: 1.0 },
    ],
    includeMatches: false,
    includeScore: false,
    ignoreLocation: true,
    threshold: 0.3, // Lower = stricter matching
    isCaseSensitive: false,
    minMatchCharLength: 2,
  })
}

function applySearchFilter(
  models: Array<FlattenedModel>,
  searchQuery: string,
): Array<FlattenedModel> {
  if (!searchQuery.trim()) return models

  const fuse = getFuseInstance(models)
  const results = fuse.search(searchQuery)

  return results.map((result) => result.item)
}
```

**TanStack Table Integration (UI Layer):**

TanStack Table manages the global filter state, which is synced to the server API:

```typescript
// TanStack Table manages globalFilter state (UI layer)
const [globalFilter, setGlobalFilter] = useState('')

const table = useReactTable({
  data: models, // Server returns filtered data
  columns,
  getCoreRowModel: getCoreRowModel(),
  state: {
    globalFilter,
  },
  onGlobalFilterChange: setGlobalFilter,
  manualFiltering: true, // Server handles actual filtering
})
```

**Search Configuration:**

| Setting         | Value                                             | Purpose                    |
| --------------- | ------------------------------------------------- | -------------------------- |
| **Search Keys** | modelName (2.0), providerName (1.5), family (1.0) | Weighted relevance         |
| **Threshold**   | 0.3                                               | Fuzzy matching tolerance   |
| **Min Match**   | 2 characters                                      | Prevents short-input noise |
| **Debounce**    | 300ms                                             | Reduces API calls          |

**Flow: TanStack Table → TanStack Query → Phase 3.5 API → Fuse.js**

1. User types in search input
2. TanStack Table updates `globalFilter` state
3. Debounced value triggers TanStack Query refetch
4. Query passes search term to Phase 3.5 API
5. Server runs Fuse.js search on full dataset
6. Server returns paginated results
7. TanStack Table renders filtered data

### 3.4 State Management Approach

This project uses **URL State as the authoritative source of truth** for all filter, search, and sort state. This approach provides several advantages over client-side state management libraries.

#### Approach A: URL State (Recommended for this project)

| State Type         | Storage Location | Format                        | Example                     |
| ------------------ | ---------------- | ----------------------------- | --------------------------- |
| Search query       | URL param        | `?search=gpt`                 | `?search=gpt-4`             |
| Provider filters   | URL param        | `?providers=openai,anthropic` | `?providers=openai`         |
| Capability filters | URL param        | `?reasoning=true`             | `?reasoning=true`           |
| Pagination         | URL param        | `?page=2&limit=50`            | `?page=1&limit=50`          |
| Sort order         | URL param        | `?sort=cost&order=desc`       | `?sort=modelName&order=asc` |
| Column visibility  | URL param        | `?cols=provider,model`        | `?cols=provider,model,cost` |

**Benefits of URL State:**

- **Shareable:** Users can share URLs with filters applied
- **Browser history:** Back/forward navigation preserves filter state
- **No sync issues:** Single source of truth for all state
- **SEO friendly:** Search engines can index filtered views
- **No localStorage needed:** Works incognito/private browsing
- **Server-Side Integration:** URL params sync to TanStack Query queryKey

**Implementation with Server-Side Pagination:**

```typescript
// State syncs to URL and TanStack Query
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 50,
})

// URL state + server-side pagination
const { data } = useQuery({
  queryKey: ['models', search, providers, reasoning, pagination],
  queryFn: () =>
    getModels({
      page: pagination.pageIndex + 1, // API uses 1-based
      limit: pagination.pageSize,
      search: search,
      providers: providers,
      reasoning: reasoning,
    }),
})
```

**Implementation:**

```typescript
// src/lib/url-state.ts
import { createSearchParams, useSearch } from '@tanstack/react-router'

interface UrlState {
  search: string
  providers: string[]
  reasoning: boolean | undefined
  toolCall: boolean | undefined
  sort: string
  order: 'asc' | 'desc'
  cols: string[]
}

function stateToSearchParams(state: Partial<UrlState>): URLSearchParams {
  const params = new URLSearchParams()

  if (state.search) params.set('search', state.search)
  if (state.providers?.length)
    params.set('providers', state.providers.join(','))
  if (state.reasoning !== undefined)
    params.set('reasoning', String(state.reasoning))
  if (state.toolCall !== undefined)
    params.set('toolCall', String(state.toolCall))
  if (state.sort) params.set('sort', state.sort)
  if (state.order) params.set('order', state.order)
  if (state.cols?.length) params.set('cols', state.cols.join(','))

  return params
}

function searchParamsToState(params: URLSearchParams): Partial<UrlState> {
  return {
    search: params.get('search') || '',
    providers: params.get('providers')?.split(',').filter(Boolean) || [],
    reasoning: params.has('reasoning')
      ? params.get('reasoning') === 'true'
      : undefined,
    toolCall: params.has('toolCall')
      ? params.get('toolCall') === 'true'
      : undefined,
    sort: params.get('sort') || '',
    order: (params.get('order') as 'asc' | 'desc') || 'asc',
    cols: params.get('cols')?.split(',').filter(Boolean) || [],
  }
}
```

#### Approach B: TanStack Query for State (Not Recommended)

Some developers consider using TanStack Query or React state for UI state:

| State Type   | Storage Location | Implementation                               |
| ------------ | ---------------- | -------------------------------------------- |
| Server state | TanStack Query   | `useQuery({ queryKey: ['models'] })`         |
| UI state     | useState         | `const [filters, setFilters] = useState()`   |
| Persistence  | localStorage     | `useEffect(() => localStorage.setItem(...))` |

**Why This Approach Is NOT Recommended:**

1. **URL state is more shareable:** Users can share filtered URLs with others
2. **TanStack Query is for server state:** Optimized for async server data, not UI state
3. **No native browser navigation:** localStorage + React state doesn't support back/forward
4. **Sync complexity:** Need to keep localStorage in sync with UI state
5. **Incognito issues:** localStorage doesn't work in private browsing

#### RECOMMENDATION: Use URL State

This project uses **Approach A (URL State)** for all filter, search, and sort state. localStorage is only used for:

- **Bookmarks:** User-saved model comparisons
- **Preferences:** UI preferences (theme, density)
- **Default column visibility:** Initial column state

```typescript
// State hierarchy for this project
interface StateHierarchy {
  // Authoritative state (URL)
  url: {
    search: string
    providers: string[]
    capabilities: { reasoning?: boolean; toolCall?: boolean }
    sort: { field: string; direction: 'asc' | 'desc' }
    columnVisibility: Record<string, boolean>
  }

  // Persistence (localStorage)
  localStorage: {
    bookmarks: string[]
    theme: 'light' | 'dark'
    defaultColumns: Record<string, boolean>
  }

  // Component state (ephemeral)
  component: {
    modalOpen: boolean
    loading: boolean
    error: Error | null
  }
}
```

---

## 4. Core Features Specifications

### 4.1 Table with TanStack Table + All 27 Columns

**Implementation with TanStack Table and TanStack Virtual:**

The models list uses `@tanstack/react-table` for table structure and column management, combined with `@tanstack/react-virtual`'s `rowVirtualizer` for efficient rendering of 500+ rows. All 27 columns from models.dev are implemented with full filtering and sorting support.

```typescript
// src/components/ModelList/ModelList.tsx
import { useState, useMemo, useRef, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { FlattenedModel } from '@/types/models'
import { Checkbox } from '@/components/Shared/Checkbox'
import { ProviderLogo } from './ProviderLogo'
import { ModelIdCopy } from './ModelIdCopy'
import { ModalityIcon } from './ModalityIcon'

// ALL 27 COLUMNS DEFINITION
export const modelColumns: ColumnDef<FlattenedModel>[] = [
  // 1. Select (checkbox for comparison)
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="Select all models"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Select ${row.original.modelName}`}
      />
    ),
    enableSorting: false,
    enableColumnFilter: false,
    size: 48,
  },

  // 2. Provider (logo + name)
  {
    accessorKey: 'providerName',
    header: 'Provider',
    cell: ({ getValue, row }) => (
      <div className="flex items-center gap-2">
        <ProviderLogo providerId={row.original.providerId} />
        <span>{getValue() as string}</span>
      </div>
    ),
    size: 180,
  },

  // 3. Model
  {
    accessorKey: 'modelName',
    header: 'Model',
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue() as string}</span>
    ),
    size: 200,
  },

  // 4. Family
  {
    accessorKey: 'family',
    header: 'Family',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
    size: 120,
  },

  // 5. Provider ID
  {
    accessorKey: 'providerId',
    header: 'Provider ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue() as string}</span>
    ),
    size: 120,
  },

  // 6. Model ID (with copy button)
  {
    accessorKey: 'modelId',
    header: 'Model ID',
    cell: ({ getValue, row }) => (
      <ModelIdCopy id={getValue() as string} />
    ),
    size: 200,
  },

  // 7. Tool Call
  {
    accessorKey: 'toolCall',
    header: 'Tool Call',
    filterFn: 'equals',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    size: 100,
  },

  // 8. Reasoning
  {
    accessorKey: 'reasoning',
    header: 'Reasoning',
    filterFn: 'equals',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    size: 100,
  },

  // 9. Input (modalities with icons)
  {
    accessorKey: 'inputModalities',
    header: 'Input',
    cell: ({ getValue }) => (
      <div className="flex gap-1">
        {(getValue() as string[]).map((modality) => (
          <ModalityIcon key={modality} type={modality} />
        ))}
      </div>
    ),
    size: 120,
  },

  // 10. Output (modalities with icons)
  {
    accessorKey: 'outputModalities',
    header: 'Output',
    cell: ({ getValue }) => (
      <div className="flex gap-1">
        {(getValue() as string[]).map((modality) => (
          <ModalityIcon key={modality} type={modality} />
        ))}
      </div>
    ),
    size: 120,
  },

  // 11. Input Cost
  {
    accessorKey: 'cost.input',
    header: 'Input Cost',
    cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
    size: 100,
  },

  // 12. Output Cost
  {
    accessorKey: 'cost.output',
    header: 'Output Cost',
    cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
    size: 100,
  },

  // 13. Reasoning Cost
  {
    accessorKey: 'cost.reasoning',
    header: 'Reasoning Cost',
    cell: ({ getValue }) =>
      getValue() ? `$${(getValue() as number).toFixed(2)}` : '-',
    size: 120,
  },

  // 14. Cache Read Cost
  {
    accessorKey: 'cost.cacheRead',
    header: 'Cache Read Cost',
    cell: ({ getValue }) =>
      getValue() ? `$${(getValue() as number).toFixed(2)}` : '-',
    size: 120,
  },

  // 15. Cache Write Cost
  {
    accessorKey: 'cost.cacheWrite',
    header: 'Cache Write Cost',
    cell: ({ getValue }) =>
      getValue() ? `$${(getValue() as number).toFixed(2)}` : '-',
    size: 120,
  },

  // 16. Audio Input Cost
  {
    accessorKey: 'cost.audioInput',
    header: 'Audio Input Cost',
    cell: ({ getValue }) =>
      getValue() ? `$${(getValue() as number).toFixed(2)}` : '-',
    size: 120,
  },

  // 17. Audio Output Cost
  {
    accessorKey: 'cost.audioOutput',
    header: 'Audio Output Cost',
    cell: ({ getValue }) =>
      getValue() ? `$${(getValue() as number).toFixed(2)}` : '-',
    size: 120,
  },

  // 18. Context Limit
  {
    accessorKey: 'limits.context',
    header: 'Context Limit',
    cell: ({ getValue }) =>
      (getValue() as number).toLocaleString(),
    size: 120,
  },

  // 19. Input Limit
  {
    accessorKey: 'limits.input',
    header: 'Input Limit',
    cell: ({ getValue }) =>
      getValue() ? (getValue() as number).toLocaleString() : '-',
    size: 120,
  },

  // 20. Output Limit
  {
    accessorKey: 'limits.output',
    header: 'Output Limit',
    cell: ({ getValue }) =>
      (getValue() as number).toLocaleString(),
    size: 120,
  },

  // 21. Structured Output
  {
    accessorKey: 'structuredOutput',
    header: 'Structured Output',
    filterFn: 'equals',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    size: 140,
  },

  // 22. Temperature
  {
    accessorKey: 'temperature',
    header: 'Temperature',
    filterFn: 'equals',
    cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    size: 100,
  },

  // 23. Weights
  {
    accessorKey: 'openWeights',
    header: 'Weights',
    cell: ({ getValue }) => (getValue() ? 'Open' : 'Closed'),
    size: 100,
  },

  // 24. Knowledge
  {
    accessorKey: 'knowledgeDate',
    header: 'Knowledge',
    cell: ({ getValue }) =>
      getValue() ? (getValue() as string).substring(0, 7) : '-',
    size: 100,
  },

  // 25. Release Date
  {
    accessorKey: 'releaseDate',
    header: 'Release Date',
    cell: ({ getValue }) => (getValue() as string),
    size: 120,
  },

  // 26. Last Updated
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ getValue }) => (getValue() as string),
    size: 120,
  },
]

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
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Transform selectedIds to rowSelection for TanStack Table
  const rowSelection = useMemo(() => {
    const selection: Record<string, boolean> = {}
    selectedIds.forEach((id) => {
      const modelIndex = models.findIndex((m) => m.id === id)
      if (modelIndex >= 0) {
        selection[modelIndex] = true
      }
    })
    return selection
  }, [selectedIds, models])

  const table = useReactTable({
    data: models,
    columns: modelColumns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = updater(rowSelection)
      Object.entries(newSelection).forEach(([index, selected]) => {
        if (selected && models[parseInt(index)]) {
          onModelSelect(models[parseInt(index)])
        }
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Row virtualizer for performance with 500+ rows
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
  })

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
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2">
        <ColumnVisibilityToggle
          table={table}
          onVisibilityChange={setColumnVisibility}
        />
      </div>

      <SearchBar
        value={globalFilter}
        onChange={setGlobalFilter}
        placeholder="Search models..."
      />

      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${
                    row.getIsSelected() ? 'bg-blue-50' : ''
                  }`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        />
      </div>
    </div>
  )
}
```

**Search Integration with TanStack Table:**

```typescript
// Search is handled via TanStack Table's built-in globalFilter
const [globalFilter, setGlobalFilter] = useState('')

const table = useReactTable({
  data: models,
  columns,
  getCoreRowModel: getCoreRowModel(),
  state: {
    globalFilter,
  },
  onGlobalFilterChange: setGlobalFilter,
  // TanStack Table handles filtering automatically!
})
```

**Filter Integration with TanStack Table:**

```typescript
// Column filters are handled via TanStack Table's built-in columnFilters
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

const table = useReactTable({
  data: models,
  columns,
  getCoreRowModel: getCoreRowModel(),
  state: {
    columnFilters,
  },
  onColumnFiltersChange: setColumnFilters,
  // TanStack Table handles column filters automatically!
})
```

**Performance Considerations:**

1. **Virtualization:** Only render visible rows + buffer (10 rows overscan)
2. **Row Height:** Fixed-height rows (48px) for predictable calculations
3. **Table Structure:** Use TanStack Table for thead, tbody, th, td structure
4. **Row Virtualizer:** Use `useVirtualizer` from `@tanstack/react-virtual` with row count
5. **Memoization:** Memoize column definitions and expensive computations

**Column Definitions (All 27):**

| #   | Column            | Key              | Sortable | Filterable | Default Visible |
| --- | ----------------- | ---------------- | -------- | ---------- | --------------- |
| 1   | Select            | select           | No       | No         | Yes             |
| 2   | Provider          | providerName     | Yes      | Yes        | Yes             |
| 3   | Model             | modelName        | Yes      | Yes        | Yes             |
| 4   | Family            | family           | Yes      | No         | No              |
| 5   | Provider ID       | providerId       | Yes      | No         | No              |
| 6   | Model ID          | modelId          | Yes      | No         | No              |
| 7   | Tool Call         | toolCall         | Yes      | Yes        | Yes             |
| 8   | Reasoning         | reasoning        | Yes      | Yes        | No              |
| 9   | Input             | inputModalities  | Yes      | No         | No              |
| 10  | Output            | outputModalities | Yes      | No         | No              |
| 11  | Input Cost        | cost.input       | Yes      | No         | Yes             |
| 12  | Output Cost       | cost.output      | Yes      | No         | No              |
| 13  | Reasoning Cost    | cost.reasoning   | Yes      | No         | No              |
| 14  | Cache Read Cost   | cost.cacheRead   | Yes      | No         | No              |
| 15  | Cache Write Cost  | cost.cacheWrite  | Yes      | No         | No              |
| 16  | Audio Input Cost  | cost.audioInput  | Yes      | No         | No              |
| 17  | Audio Output Cost | cost.audioOutput | Yes      | No         | No              |
| 18  | Context Limit     | limits.context   | Yes      | No         | Yes             |
| 19  | Input Limit       | limits.input     | Yes      | No         | No              |
| 20  | Output Limit      | limits.output    | Yes      | No         | No              |
| 21  | Structured Output | structuredOutput | Yes      | Yes        | No              |
| 22  | Temperature       | temperature      | Yes      | Yes        | No              |
| 23  | Weights           | openWeights      | Yes      | No         | No              |
| 24  | Knowledge         | knowledgeDate    | Yes      | No         | No              |
| 25  | Release Date      | releaseDate      | Yes      | No         | No              |
| 26  | Last Updated      | lastUpdated      | Yes      | No         | No              |

**Virtual Table vs Card List Decision:**

- **Virtual Table** is preferred for this use case because:
  - Server-side pagination reduces initial load (only 50 models per page)
  - Tabular data is easier to scan and compare
  - Built-in column sorting and visibility features
  - Better keyboard navigation for accessibility
  - Consistent row height simplifies virtualization
  - TanStack Table's manual modes work seamlessly with virtualization

### 4.1.1 Server-Side Pagination, Search, and Filtering

This project uses **server-side operations** for optimal performance with large datasets. TanStack Table's `manualPagination` and `manualFiltering` modes delegate data processing to the server while maintaining TanStack Table's excellent UI state management.

**Architecture Overview:**

```
┌─────────────────────────────────────────────────┐
│           TanStack Table UI Layer               │
│  - Pagination controls                         │
│  - Filter inputs (global & column)             │
│  - State: pagination, globalFilter, columnFilters │
└─────────────────────┬───────────────────────────┘
                      │ onXChange callbacks
                      ▼
┌─────────────────────────────────────────────────┐
│          React State (useState)                │
│  - Owned by component, controlled by table     │
└─────────────────────┬───────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│         TanStack Query (useQuery)              │
│  - queryKey: ['models', pagination, filters]   │
│  - Detects state changes, triggers fetch       │
└─────────────────────┬───────────────────────────┘
                      │ API Request
                      ▼
┌─────────────────────────────────────────────────┐
│        Phase 3.5 Server API                   │
│  - Accepts: page, pageSize, filters, search  │
│  - Fuse.js fuzzy search                       │
│  - Returns: { data: Model[], pagination: {...}} │
└─────────────────────────────────────────────────┘
```

**Complete Server-Side Integration Example:**

```typescript
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  type PaginationState,
  type ColumnFiltersState,
  type GlobalFilterState,
} from '@tanstack/react-table'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { modelsQueryOptions } from '@/lib/api/models'

// 1. External state controlled by TanStack Table
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 50,
})
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
const [globalFilter, setGlobalFilter] = useState<GlobalFilterState>('')

// 2. TanStack Query fetches from Phase 3.5 API
const dataQuery = useQuery({
  ...modelsQueryOptions({
    page: pagination.pageIndex + 1, // API uses 1-based indexing
    limit: pagination.pageSize,
    search: globalFilter,
    providers: columnFilters
      .find((f) => f.id === 'providerName')
      ?.value?.map(String) ?? [],
  }),
  placeholderData: keepPreviousData,
})

// 3. TanStack Table configured for server-side operations
const table = useReactTable({
  data: dataQuery.data?.data ?? [],
  columns: modelColumns,
  getCoreRowModel: getCoreRowModel(),

  // Server-side pagination
  manualPagination: true,
  rowCount: dataQuery.data?.pagination.total,
  state: { pagination },
  onPaginationChange: setPagination,

  // Server-side filtering
  manualFiltering: true,
  state: { columnFilters, globalFilter },
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
})

// 4. Render table with pagination controls
return (
  <div>
    <SearchBar value={globalFilter} onChange={setGlobalFilter} />
    <table>...</table>
    <div className="pagination">
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </button>
      <span>
        Page {table.getState().pagination.pageIndex + 1} of{' '}
        {table.getPageCount()}
      </span>
      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </button>
    </div>
  </div>
)
```

**Key Configuration Options:**

| Option                  | Purpose                         | Required for Server-Side |
| ----------------------- | ------------------------------- | ------------------------ |
| `manualPagination`      | Disables client-side pagination | Yes                      |
| `manualFiltering`       | Disables client-side filtering  | Yes                      |
| `rowCount`              | Total row count from server     | Yes (for pagination)     |
| `state.pagination`      | External pagination state       | Yes                      |
| `onPaginationChange`    | Callback for pagination changes | Yes                      |
| `state.columnFilters`   | External filter state           | Yes                      |
| `onColumnFiltersChange` | Callback for filter changes     | Yes                      |
| `state.globalFilter`    | External search state           | Yes                      |
| `onGlobalFilterChange`  | Callback for search changes     | Yes                      |

**Benefits of Server-Side Operations:**

1. **Reduced Initial Load:** Only fetch first page (50 models) instead of all 500+
2. **Consistent Performance:** Query time stable regardless of dataset size
3. **Memory Efficient:** Server handles filtering, not client memory
4. **Scalable:** Works with any dataset size
5. **Fuzzy Search:** Fuse.js provides intelligent matching on server

**Reference:** See `docs/research/phase5-server-side-tanstack-table.md` for detailed patterns and examples.

### 4.2 Filtering with TanStack Table

TanStack Table provides built-in filtering capabilities for UI state management. With server-side architecture, we use TanStack Table's `filterFn` system for UI while delegating actual filtering to the Phase 3.5 API.

**Server-Side Filtering Pattern:**

````typescript
// TanStack Table manages filter state, server handles actual filtering
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

const table = useReactTable({
  data: models, // Server returns pre-filtered data
  columns: modelColumns,
  getCoreRowModel: getCoreRowModel(),
  manualFiltering: true, // Server-side filtering
  state: {
    columnFilters,
   },
   onColumnFiltersChange: setColumnFilters,
 })

**Custom Filter Functions:**

TanStack Table supports various built-in filter functions:

```typescript
// Column definitions with custom filter functions
{
  accessorKey: 'toolCall',
  header: 'Tool Call',
  filterFn: 'equals', // Boolean equality check
}

{
  accessorKey: 'cost.input',
  header: 'Input Cost',
  filterFn: 'inNumberRange', // Range filtering
}

{
  accessorKey: 'providerName',
  header: 'Provider',
  filterFn: 'includesString', // Substring matching
}
````

**Server-Side Filtering with Phase 3.5 API:**

Filters are applied on the server via the Phase 3.5 API. TanStack Table manages the filter UI state while the actual filtering happens on the server.

```typescript
// Server-side filter application (src/lib/api/models.ts)
function applyFilters(
  models: Array<FlattenedModel>,
  input: GetModelsInput,
): Array<FlattenedModel> {
  let filtered = models

  // Apply search filter (Fuse.js)
  if (input.search.trim()) {
    filtered = applySearchFilter(filtered, input.search)
  }

  // Apply provider filter
  if (input.providers.length > 0) {
    filtered = filtered.filter((model) =>
      input.providers.includes(model.providerName),
    )
  }

  // Apply capability filters
  if (input.reasoning !== undefined) {
    filtered = filtered.filter((model) => model.reasoning === input.reasoning)
  }

  if (input.toolCall !== undefined) {
    filtered = filtered.filter((model) => model.toolCall === input.toolCall)
  }

  if (input.structuredOutput !== undefined) {
    filtered = filtered.filter(
      (model) => model.structuredOutput === input.structuredOutput,
    )
  }

  return filtered
}
```

**Filter UI Components:**

The filter UI updates URL state which is then synced to TanStack Table:

```typescript
// src/components/FilterPanel/FilterPanel.tsx
import { useSearch, useRouter } from '@tanstack/react-router'
import type { FilterState } from '@/types/models'

interface FilterPanelProps {
  providers: { id: string; name: string }[]
}

export function FilterPanel({ providers }: FilterPanelProps) {
  const search = useSearch()
  const router = useRouter()

  const updateFilters = (newFilters: Partial<FilterState>) => {
    router.navigate({
      search: (prev) => ({
        ...prev,
        ...newFilters,
      }),
    })
  }

  return (
    <aside className="filter-panel">
      <ProviderFilter
        providers={providers}
        selected={search.providers || []}
        onChange={(providers) => updateFilters({ providers })}
      />

      <CapabilityFilter
        capabilities={{
          reasoning: search.reasoning,
          toolCall: search.toolCall,
        }}
        onChange={(capabilities) => updateFilters(capabilities)}
      />
    </aside>
  )
}
```

**Available Filter Functions in TanStack Table:**

| Filter Fn        | Type   | Description                      |
| ---------------- | ------ | -------------------------------- |
| `equals`         | any    | Exact equality                   |
| `equalsString`   | string | Case-insensitive string equality |
| `includesString` | string | Substring inclusion              |
| `inNumberRange`  | number | Number within range              |
| `inDateRange`    | date   | Date within range                |
| `arrIncludes`    | array  | Array contains value             |

**URL State for Filters:**

All filter state is persisted in URL for shareability:

```
?providers=openai,anthropic
&reasoning=true
&toolCall=false
&sort=cost.input
&order=asc
```

### 4.3 Search System

**Search with TanStack Table's globalFilter:**

TanStack Table provides built-in global filtering for UI state management. The actual fuzzy search is handled server-side via the Phase 3.5 API with Fuse.js, providing intelligent, typo-tolerant search results.

**Search Flow:**

1. User types in SearchBar component
2. Input is debounced (300ms) to reduce API calls
3. Debounced value synced to URL (`?search=query`)
4. TanStack Query detects queryKey change
5. API receives search parameter
6. Server runs Fuse.js fuzzy search on full dataset
7. Server returns paginated filtered results
8. TanStack Table renders filtered data

**TanStack Table Integration (Server-Side Mode):**

```typescript
// src/components/SearchBar/SearchBar.tsx
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useCallback, useState, useEffect } from 'react'
import { useSearch, useRouter } from '@tanstack/react-router'

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
  const router = useRouter()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }, [])

  // Sync debounced value to parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange, value])

  // Sync to URL
  useEffect(() => {
    router.navigate({
      search: (prev) => {
        if (debouncedValue) {
          prev.set('search', debouncedValue)
        } else {
          prev.delete('search')
        }
        return prev
      },
    })
  }, [debouncedValue, router])

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('')
  }, [onChange])

  return (
    <div className={`relative ${className ?? ''}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Search models and providers"
        autoComplete="off"
      />

      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
```

**TanStack Table Integration (Server-Side Mode):**

```typescript
// TanStack Table manages globalFilter state, server handles fuzzy search
const [globalFilter, setGlobalFilter] = useState('')

const table = useReactTable({
  data: models, // Server returns filtered data
  columns,
  getCoreRowModel: getCoreRowModel(),
  manualFiltering: true, // Server-side filtering
  state: {
    globalFilter,
  },
  onGlobalFilterChange: setGlobalFilter,
})
```

**Search Scope:**

With server-side Fuse.js fuzzy search, the search intelligently matches against configured keys. Fuse.js configuration prioritizes relevance:

| Key            | Weight | Purpose                                       |
| -------------- | ------ | --------------------------------------------- |
| `modelName`    | 2.0    | Highest priority - model names most important |
| `providerName` | 1.5    | Provider names secondary                      |
| `family`       | 1.0    | Model family lower priority                   |

**No Search Across:**

- Boolean values (Yes/No columns)
- Cost values (numeric columns)
- Date columns
- Internal IDs (unless text-based)

**URL State for Search:**

Search state is persisted in URL for shareability:

```
?search=gpt-4
```

**Debouncing:**

Search input is debounced (300ms) to prevent excessive API calls. The debounced value triggers TanStack Query refetch, which calls the Phase 3.5 API with the search parameter.

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

### 4.6 Column Visibility Management

The column visibility feature allows users to show/hide table columns based on their preferences. Column visibility state is synced with URL for shareability and persisted to localStorage for session persistence.

**Default Visible Columns (6 columns):**

| Column        | Key            | Reason                            |
| ------------- | -------------- | --------------------------------- |
| Select        | select         | Core functionality for comparison |
| Provider      | providerName   | Important for filtering by source |
| Model         | modelName      | Primary identification            |
| Tool Call     | toolCall       | Key capability                    |
| Input Cost    | cost.input     | Key comparison metric             |
| Context Limit | limits.context | Key specification                 |

**URL State for Column Visibility:**

Column visibility is synced with URL `?cols=provider,model,tool-call`:

```typescript
// src/lib/url-state.ts
export function getColumnVisibilityFromUrl(
  params: URLSearchParams,
): Record<string, boolean> {
  const colsParam = params.get('cols')
  const defaultVisible = [
    'select',
    'providerName',
    'modelName',
    'toolCall',
    'cost.input',
    'limits.context',
  ]

  if (!colsParam) {
    // Return defaults
    return Object.fromEntries(
      modelColumns.map((col) => [
        col.id || String(col.accessorKey),
        defaultVisible.includes(col.id || String(col.accessorKey)),
      ]),
    )
  }

  const visibleCols = colsParam.split(',')
  return Object.fromEntries(
    modelColumns.map((col) => [
      col.id || String(col.accessorKey),
      visibleCols.includes(col.id || String(col.accessorKey)),
    ]),
  )
}

export function getUrlFromColumnVisibility(
  visibility: Record<string, boolean>,
): string {
  const visibleCols = Object.entries(visibility)
    .filter(([, isVisible]) => isVisible)
    .map(([colId]) => colId)
    .join(',')

  return `?cols=${visibleCols}`
}
```

**Column Visibility Toggle Component:**

```typescript
// src/components/ModelList/ColumnVisibilityToggle.tsx
import { useCallback, useState, useEffect } from 'react'
import type { Table } from '@tanstack/react-table'
import { Checkbox } from '@/components/Shared/Checkbox'

interface ColumnVisibilityToggleProps {
  table: Table<FlattenedModel>
  onVisibilityChange: (visibility: Record<string, boolean>) => void
}

const DEFAULT_VISIBLE_COLUMNS = [
  'select',
  'providerName',
  'modelName',
  'toolCall',
  'cost.input',
  'limits.context',
]

const ALL_COLUMNS = [
  { id: 'select', label: 'Select' },
  { id: 'providerName', label: 'Provider' },
  { id: 'modelName', label: 'Model' },
  { id: 'family', label: 'Family' },
  { id: 'providerId', label: 'Provider ID' },
  { id: 'modelId', label: 'Model ID' },
  { id: 'toolCall', label: 'Tool Call' },
  { id: 'reasoning', label: 'Reasoning' },
  { id: 'inputModalities', label: 'Input' },
  { id: 'outputModalities', label: 'Output' },
  { id: 'cost.input', label: 'Input Cost' },
  { id: 'cost.output', label: 'Output Cost' },
  { id: 'cost.reasoning', label: 'Reasoning Cost' },
  { id: 'cost.cacheRead', label: 'Cache Read Cost' },
  { id: 'cost.cacheWrite', label: 'Cache Write Cost' },
  { id: 'cost.audioInput', label: 'Audio Input Cost' },
  { id: 'cost.audioOutput', label: 'Audio Output Cost' },
  { id: 'limits.context', label: 'Context Limit' },
  { id: 'limits.input', label: 'Input Limit' },
  { id: 'limits.output', label: 'Output Limit' },
  { id: 'structuredOutput', label: 'Structured Output' },
  { id: 'temperature', label: 'Temperature' },
  { id: 'openWeights', label: 'Weights' },
  { id: 'knowledgeDate', label: 'Knowledge' },
  { id: 'releaseDate', label: 'Release Date' },
  { id: 'lastUpdated', label: 'Last Updated' },
]

export function ColumnVisibilityToggle({
  table,
  onVisibilityChange,
}: ColumnVisibilityToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleColumn = useCallback(
    (columnId: string) => {
      const column = table.getColumn(columnId)
      if (column) {
        column.toggleVisibility()
        const newVisibility = {
          ...table.getState().columnVisibility,
          [columnId]: !column.getIsVisible(),
        }
        onVisibilityChange(newVisibility)
      }
    },
    [table, onVisibilityChange],
  )

  const showAll = useCallback(() => {
    table.getAllLeafColumns().forEach((col) => col.toggleVisibility(true))
    const newVisibility = Object.fromEntries(
      table.getAllLeafColumns().map((col) => [col.id, true]),
    )
    onVisibilityChange(newVisibility)
  }, [table, onVisibilityChange])

  const resetToDefault = useCallback(() => {
    table.getAllLeafColumns().forEach((col) => {
      const shouldBeVisible = DEFAULT_VISIBLE_COLUMNS.includes(col.id)
      col.toggleVisibility(shouldBeVisible)
    })
    const newVisibility = Object.fromEntries(
      table.getAllLeafColumns().map((col) => [
        col.id,
        DEFAULT_VISIBLE_COLUMNS.includes(col.id),
      ]),
    )
    onVisibilityChange(newVisibility)
  }, [table, onVisibilityChange])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        aria-label="Toggle column visibility"
        aria-expanded={isOpen}
      >
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Columns
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-sm font-medium text-gray-700">
                Visible Columns
              </span>
              <div className="flex gap-2">
                <button
                  onClick={resetToDefault}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Reset
                </button>
                <button
                  onClick={showAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Show all
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {ALL_COLUMNS.map((column) => {
                const isVisible = table.getColumn(column.id)?.getIsVisible() ?? false
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={isVisible}
                      onChange={() => toggleColumn(column.id)}
                      aria-label={`${column.label} column`}
                    />
                    <span className="text-sm text-gray-700">{column.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

**Persistence Strategy:**

1. **URL (Primary):** Column visibility is synced to URL `?cols=...` for shareability
2. **localStorage (Secondary):** Default column visibility preferences saved for new users

```typescript
// Persistence to localStorage for defaults
const COLUMN_VISIBILITY_STORAGE_KEY = 'column-visibility-defaults'

function saveDefaultColumnVisibility(
  visibility: Record<string, boolean>,
): void {
  localStorage.setItem(
    COLUMN_VISIBILITY_STORAGE_KEY,
    JSON.stringify(visibility),
  )
}

function loadDefaultColumnVisibility(): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY)
  return saved ? JSON.parse(saved) : null
}
```

**UI Requirements:**

1. **Toggle Button:** Located above the table on the right side
2. **Dropdown Menu:** Shows all 27 columns with checkboxes
3. **Show All/Reset:** Quick actions to toggle all columns or reset to defaults
4. **Persistence:** URL for sharing, localStorage for defaults
5. **Responsive:** Works on mobile with touch targets

**Accessibility Considerations:**

- `aria-label` on toggle button
- `aria-expanded` state management
- Keyboard navigation through column list
- Focus management for dropdown

---

## 5. Component Specifications

### 5.1 ModelList Component

```typescript
// src/components/ModelList/ModelList.tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useCallback } from 'react'
import type { FlattenedModel } from '@/types/models'
import type { ColumnDef } from '@tanstack/react-table'
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle'

interface ModelListProps {
  models: FlattenedModel[]
  onModelSelect: (model: FlattenedModel) => void
  selectedIds: string[]
  isLoading: boolean
  error: Error | null
}

// Column definitions for the table
const createModelColumns = (): ColumnDef<FlattenedModel>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Select ${row.original.modelName}`}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'modelName',
    header: 'Model',
    cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'providerName',
    header: 'Provider',
  },
  {
    accessorKey: 'reasoning',
    header: 'Reasoning',
    cell: (info) => (info.getValue() ? '✓' : '—'),
  },
  {
    accessorKey: 'toolCall',
    header: 'Tools',
    cell: (info) => (info.getValue() ? '✓' : '—'),
  },
  {
    accessorKey: 'openWeights',
    header: 'Open',
    cell: (info) => (info.getValue() ? '✓' : '—'),
  },
  {
    accessorKey: 'cost.input',
    header: 'Input Cost',
    cell: (info) => `$${(info.getValue() as number).toFixed(2)}/M`,
  },
  {
    accessorKey: 'cost.output',
    header: 'Output Cost',
    cell: (info) => `$${(info.getValue() as number).toFixed(2)}/M`,
  },
  {
    accessorKey: 'limits.context',
    header: 'Context',
    cell: (info) => (info.getValue() as number).toLocaleString(),
  },
  {
    accessorKey: 'releaseDate',
    header: 'Released',
  },
]

export function ModelList({
  models,
  onModelSelect,
  selectedIds,
  isLoading,
  error,
}: ModelListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Initialize table with TanStack Table
  const table = useReactTable({
    data: models,
    columns: createModelColumns(),
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    state: {
      rowSelection: Object.fromEntries(
        selectedIds.map((id) => {
          const model = models.find((m) => m.id === id)
          return [model?.rowIndex, true]
        }).filter(([, v]) => v !== undefined),
      ),
    },
    onRowSelectionChange: (updater) => {
      const newSelection = updater({})
      Object.entries(newSelection).forEach(([index, selected]) => {
        if (selected && models[parseInt(index)]) {
          onModelSelect(models[parseInt(index)])
        }
      })
    },
  })

  // Row virtualizer for performance
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 10,
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
    <div className="flex flex-col h-full">
      <div className="flex justify-end p-2">
        <ColumnVisibilityToggle table={table} />
      </div>
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index]
              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 ${row.getIsSelected() ? 'bg-blue-50' : ''}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
                    >
                      {cell.column.columnDef.cell(cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        />
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
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/integrations/tanstack-query/root-provider'
import { TanStackRouterDevtools } from '@/integrations/tanstack-query/devtools'
import { RouterProvider } from '@tanstack/react-router'

// Import routes
import { IndexRoute } from './index'
import { ModelRoute } from './models/$modelId'

export const Route = createFileRoute('/')({
  component: AppRoot,
})

function AppRoot() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootComponent />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  )
}

function RootComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <RouterOutlet />
      </main>
    </div>
  )
}
```

**Models List Route with Loader:**

```typescript
// src/routes/models.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'
import { ModelList } from '@/components/ModelList'
import { FilterPanel } from '@/components/FilterPanel'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

export const Route = createFileRoute('/models')({
  loader: async () => {
    // Check cache first
    const cached = queryClient.getQueryData(['models'])
    if (cached) {
      return cached
    }

    // Fetch fresh data
    const data = await fetchModels()
    const flattened = flattenModelsData(data)

    // Cache for 24 hours
    queryClient.setQueryData(['models'], flattened)

    return flattened
  },
  component: ModelsRoute,
})

function ModelsRoute() {
  const models = Route.useLoaderData()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [comparisonModels, setComparisonModels] = useState<FlattenedModel[]>([])

  const handleModelSelect = useCallback((model: FlattenedModel) => {
    setSelectedIds((prev) => {
      if (prev.includes(model.id)) {
        return prev.filter((id) => id !== model.id)
      }
      if (prev.length < 4) {
        return [...prev, model.id]
      }
      return prev
    })
  }, [])

  return (
    <div className="flex">
      <FilterPanel
        providers={getUniqueProviders(models)}
        onFiltersChange={handleFilterChange}
      />
      <ModelList
        models={models}
        onModelSelect={handleModelSelect}
        selectedIds={selectedIds}
        isLoading={false}
        error={null}
      />
    </div>
  )
}
```

**Model Detail Route:**

```typescript
// src/routes/models/$modelId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchModels } from '@/lib/models-api'
import { flattenModelsData } from '@/lib/models-transform'
import { queryClient } from '@/integrations/tanstack-query/root-provider'

export const Route = createFileRoute('/models/$modelId')({
  loader: async ({ params }) => {
    const allModels = queryClient.getQueryData(['models']) as FlattenedModel[]
      || flattenModelsData(await fetchModels())

    const model = allModels.find((m) => m.id === params.modelId)

    if (!model) {
      throw new Error(`Model not found: ${params.modelId}`)
    }

    return model
  },
  component: ModelDetailRoute,
})

function ModelDetailRoute() {
  const model = Route.useLoaderData()

  return (
    <div className="model-detail">
      <h1>{model.modelName}</h1>
      <ProviderLogo providerId={model.providerId} />
      {/* Detail content */}
    </div>
  )
}
```

**Search Params Integration:**

```typescript
// src/routes/models.tsx
export const Route = createFileRoute('/models')({
  loader: async ({ deps }) => {
    // loader receives search params via deps
    const data = await fetchModels()
    return flattenModelsData(data)
  },
  component: ModelsRoute,
})

function ModelsRoute() {
  const models = Route.useLoaderData()
  const search = useSearch() // Access search params

  // Filter models based on search params
  const filteredModels = useMemo(() => {
    return applySearchFilters(models, search)
  }, [models, search])

  return <ModelList models={filteredModels} />
}
```

**Route Structure:**

| Route Pattern | File                  | Component        | Loader Data               |
| ------------- | --------------------- | ---------------- | ------------------------- |
| `/`           | `index.tsx`           | IndexRoute       | Featured models, stats    |
| `/models`     | `models.tsx`          | ModelsRoute      | All flattened models      |
| `/models/:id` | `models/$modelId.tsx` | ModelDetailRoute | Single model with details |
| `/compare`    | `compare.tsx`         | CompareRoute     | Selected model IDs        |

**Error Handling:**

```typescript
// src/routes/__root.tsx
import { ErrorBoundary } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: AppRoot,
  errorComponent: ({ error }) => (
    <div className="error-state">
      <h1>Something went wrong</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  ),
})
```

**Lazy Loading Routes:**

```typescript
// src/routes/__root.tsx
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const ModelsRoute = lazy(() =>
  import('./models').then((mod) => ({ default: mod.ModelList })),
)

export const Route = createFileRoute('/models')({
  component: ModelsRoute,
})
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

export const fetchModels = createServerFn({ method: 'GET' }).handler(
  async () => {
    const response = await fetch('https://models.dev/api.json')
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }
    return response.json()
  },
)

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

This document has been separated into a dedicated implementation phases document for better tracking and maintainability.

**See:** `docs/implementation-phases.md` for detailed phase-by-phase implementation plan, progress tracking, and deliverables.

**Overview:**

- Total Phases: 11 (plus Phase 3.5 for custom API with pagination)
- Current Status: Phase 3 (API Integration) completed, Phase 3.5 in progress
- Architecture: Custom server API with pagination (new direction)

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

// ============================================
// API Response Types (from models.dev)
// ============================================

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
  structured_output?: boolean
  knowledge?: string // YYYY-MM format
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
    reasoning?: number
    input_audio?: number
    output_audio?: number
  }
  limit: {
    context: number // max context tokens
    input?: number // max input tokens (optional)
    output: number // max output tokens
  }
}

// ============================================
// Flattened Model (for easier processing with TanStack Table)
// ============================================

export interface FlattenedModel {
  // Composite ID (providerId/modelId)
  id: string

  // Provider info
  providerId: string
  providerName: string

  // Model info
  modelId: string
  modelName: string
  family: string

  // Capabilities (boolean flags)
  attachment: boolean
  reasoning: boolean
  toolCall: boolean
  structuredOutput?: boolean
  temperature?: boolean

  // Dates
  knowledgeDate?: string
  releaseDate: string
  lastUpdated: string

  // Modalities
  inputModalities: string[]
  outputModalities: string[]

  // Access
  openWeights: boolean

  // Costs (normalized to dollars per 1M tokens)
  cost: {
    input: number
    output: number
    cacheRead?: number | null
    cacheWrite?: number | null
    reasoning?: number | null
    audioInput?: number | null
    audioOutput?: number | null
  }

  // Limits
  limits: {
    context: number
    input?: number | null
    output: number
  }

  // Metadata
  npm: string
  apiEndpoint?: string
  documentation: string
  environment: string[]
}

// ============================================
// Filter State
// ============================================

export interface FilterState {
  providers: string[]
  capabilities: {
    reasoning?: boolean
    toolCall?: boolean
    structuredOutput?: boolean
    temperature?: boolean
    openWeights?: boolean
  }
  costRange: {
    min: number
    max: number | null
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
  capabilities: {},
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

// ============================================
// Sort Types
// ============================================

export type SortField =
  | 'providerName'
  | 'modelName'
  | 'family'
  | 'providerId'
  | 'modelId'
  | 'toolCall'
  | 'reasoning'
  | 'cost.input'
  | 'cost.output'
  | 'cost.reasoning'
  | 'cost.cacheRead'
  | 'cost.cacheWrite'
  | 'cost.audioInput'
  | 'cost.audioOutput'
  | 'limits.context'
  | 'limits.input'
  | 'limits.output'
  | 'structuredOutput'
  | 'temperature'
  | 'openWeights'
  | 'knowledgeDate'
  | 'releaseDate'
  | 'lastUpdated'

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: SortField
  direction: SortDirection
}

// ============================================
// URL State
// ============================================

export interface UrlState {
  search: string
  providers: string
  reasoning: string
  toolCall: string
  structuredOutput: string
  temperature: string
  sort: string
  order: 'asc' | 'desc'
  cols: string
}

// ============================================
// Comparison Types
// ============================================

export interface ComparisonState {
  selectedIds: string[]
  maxSelection: 4
}
```

---

## Appendix B: File Structure

```
src/
├── components/
│   ├── ModelList/
│   │   ├── ModelList.tsx              # Main table component with TanStack Table
│   │   ├── ColumnVisibilityToggle.tsx # Column selector UI
│   │   ├── ProviderLogo.tsx           # Provider logo component
│   │   ├── ModelIdCopy.tsx            # Copy button for Model ID
│   │   ├── ModalityIcon.tsx           # Icons for text/image/audio/video/pdf
│   │   └── index.ts
│   ├── FilterPanel/
│   │   ├── FilterPanel.tsx
│   │   ├── ProviderFilter.tsx
│   │   ├── CapabilityFilter.tsx
│   │   ├── CostRangeFilter.tsx
│   │   ├── DateRangeFilter.tsx
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
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   ├── CostDisplay.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── SkeletonList.tsx
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
│   ├── models.tsx
│   ├── models.$modelId.tsx
│   └── compare.tsx
├── lib/
│   ├── models-api.ts                  # Server function for fetchModels
│   ├── models-transform.ts            # Flatten API response
│   ├── url-state.ts                   # URL state sync utilities
│   └── query-client.ts                # (use existing from root-provider)
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useComparison.ts
├── types/
│   └── models.ts                      # All TypeScript types
├── data/
│   └── sample-models.ts               # Demo data for development
├── integrations/
│   └── tanstack-query/
│       ├── root-provider.tsx          # Existing queryClient
│       └── devtools.tsx               # Existing devtools
├── styles/
│   └── styles.css
├── router.tsx
└── App.tsx
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

export const fetchModels = createServerFn({ method: 'GET' }).handler(
  async () => {
    const response = await fetch('https://models.dev/api.json', {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`)
    }

    return response.json() as Promise<ModelsApiResponse>
  },
)
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

| Version | Date       | Author           | Changes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ---------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1.0   | 2025-12-29 | Technical Writer | - Removed Section 11 (Implementation Phases) and replaced with reference to `docs/implementation-phases.md`<br>- Added Phase 3.5: Custom Server API with Pagination<br>- Renumbered phases 4-10 to 5-11<br>- Updated architecture to use custom server API with pagination instead of fetching all data at once                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2.0.0   | 2025-12-29 | Senior Engineer  | - Complete rewrite for v2.0.0 with TanStack Table integration<br>- Search and Filters now integrate with TanStack Table (globalFilter, columnFilters)<br>- Use existing queryClient from `src/integrations/tanstack-query/root-provider`<br>- All 27 columns from models.dev implemented in Section 4.1<br>- Comparison feature moved to Phase 10 (optional)<br>- Phases broken down from 4 to 10 smaller phases (11.1-11.10)<br>- Updated Section 2.1 Data Flow Diagram to remove "computed dataset"<br>- Completely rewritten Section 3.4 State Management with URL State vs TanStack Query comparison<br>- Removed Section 3.2 (Data Transformation - replaced with streamlined version)<br>- Enhanced Section 4.6 Column Visibility with URL sync<br>- Updated Section 6.1 to use existing queryClient<br>- Updated Appendix A with all 27 column types<br>- Updated Appendix B with new component file structure |
| 1.4.0   | 2025-12-28 | Senior Engineer  | - Models list now uses TanStack Table for table structure with row virtualization<br>- Added Section 4.1: Table List with TanStack Table and Row Virtualization<br>- Added Section 4.6: Column Visibility Management<br>- Updated ModelList component (5.1) to use TanStack Table<br>- Added ColumnVisibilityToggle component<br>- Column visibility persisted to localStorage<br>- Updated TanStack ecosystem table (1.3) to show TanStack Table for main models list                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 1.3.0   | 2025-12-28 | Senior Engineer  | - Updated all `createServerFn` examples to use the correct TanStack Start pattern: `createServerFn({ method: 'GET' }).handler(async () => { })` instead of deprecated `createServerFn('GET', async () => { })`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 1.2.0   | 2025-12-28 | Senior Engineer  | - Moved hooks/ and utils/ to root level (src/hooks/, src/utils/)<br>- Removed entry files (App.tsx, main.tsx, entry-client.tsx, entry-server.tsx)<br>- Updated file structure for TanStack Start architecture<br>- Updated Appendix C API Reference to explain createServerFn pattern instead of REST endpoints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 1.1.0   | 2025-12-28 | Technical Writer | - Removed custom cache manager - use TanStack Query's built-in caching<br>- Updated to Tailwind CSS v4 with @theme inline<br>- Added TanStack Start server functions (createServerFn)<br>- Updated routing with loaders for SSR<br>- Emphasized full TanStack ecosystem integration<br>- Updated architecture diagrams and code examples                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 1.0.0   | 2025-12-28 | Technical Writer | Initial specification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

_End of Technical Specification Document_

```

```
