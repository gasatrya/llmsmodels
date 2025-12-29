# Research: TanStack Start Server API Patterns for Models Explorer

**Date:** 2025-12-29
**Version Verified:** TanStack Start v1.145.0, TanStack Query v5.90.13, Fuse.js v7.1.0

## 1. Executive Summary

This research documents best practices for implementing a custom server API with TanStack Start, focusing on:

1. **Server Functions with `createServerFn`:** Type-safe server functions with Zod validation
2. **In-Memory Caching:** Module-level caching patterns for server-side data
3. **Server-Side Pagination:** Efficient pagination with metadata
4. **Server-Side Filtering and Search:** Text search performance considerations

**Key Findings:**

- Use `createServerFn` with Zod validators for type-safe input validation
- Module-level variables (const/let) provide efficient in-memory caching across requests
- Fuse.js can be server-side instantiated with threshold tuning for performance
- Pagination should include: `page`, `limit`, `total`, `totalPages`, and `hasMore`

**Implementation Plan:**

1. Install Zod (not yet in dependencies)
2. Create `getModels` server function with validation, caching, pagination, and search
3. Integrate with TanStack Query for client-side state management

---

## 2. TanStack Start Server Functions with `createServerFn`

### 2.1 Basic Server Function Structure

TanStack Start provides `createServerFn` to create server-only functions that can be called from anywhere in the application.

```typescript
import { createServerFn } from '@tanstack/react-start'

export const getServerTime = createServerFn().handler(async () => {
  // This runs only on the server
  return new Date().toISOString()
})

// Call from anywhere - components, loaders, hooks, etc.
const time = await getServerTime()
```

**Key Points:**

- Server functions run exclusively on the server
- Errors are automatically serialized to the client
- Can be called from loaders, components, or hooks

### 2.2 Input Validation with Zod

Use Zod for runtime validation and TypeScript type inference.

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
})

export const createUser = createServerFn({ method: 'POST' })
  .inputValidator(UserSchema)
  .handler(async ({ data }) => {
    // data is fully typed and validated
    return `Created user: ${data.name}, age ${data.age}`
  })
```

**Key Points:**

- `.inputValidator()` accepts a Zod schema or a custom validator function
- Validation errors are automatically thrown and serialized to the client
- The `data` parameter in the handler is fully typed

### 2.3 Custom Validation Function

You can also use a custom validation function for more control:

```typescript
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    const loginSchema = z.object({
      email: z.string().email().max(255),
      password: z.string().min(8).max(100),
    })
    return loginSchema.parse(data)
  })
  .handler(async ({ data }) => {
    // data is now validated
  })
```

### 2.4 Using Middleware for Context

Middleware allows you to add authentication, logging, or other cross-cutting concerns:

```typescript
import { createMiddleware } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

const mySchema = z.object({
  workspaceId: z.string(),
})

const workspaceMiddleware = createMiddleware({ type: 'function' })
  .inputValidator(zodValidator(mySchema))
  .server(({ next, data }) => {
    console.log('Workspace ID:', data.workspaceId)
    return next()
  })

export const getTodos = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(z.object({ userId: z.string() })))
  .middleware([authMiddleware])
  .handler(async ({ data, context }) => {
    // Fully typed data and context
    return db.todos.findMany({ where: { userId: data.userId } })
  })
```

**Key Points:**

- Middleware runs before the handler
- Can pass context down the chain
- `.middleware()` accepts an array of middleware functions

### 2.5 Error Handling Best Practices

Server functions automatically serialize errors to the client:

```typescript
export const riskyFunction = createServerFn().handler(async () => {
  if (Math.random() > 0.5) {
    throw new Error('Something went wrong!')
  }
  return { success: true }
})

// Errors are serialized to the client
try {
  await riskyFunction()
} catch (error) {
  console.log(error.message) // "Something went wrong!"
}
```

**Robust Error Handling Pattern:**

```typescript
const riskyOperation = createServerFn().handler(async () => {
  try {
    return await performOperation()
  } catch (error) {
    // Log server errors with context
    console.error('[SERVER ERROR]:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      // Add request context if available
    })

    // Return user-friendly error
    throw new Error('Operation failed. Please try again.')
  }
})
```

**Key Points:**

- Always wrap external calls in try-catch
- Log errors with context for debugging
- Return user-friendly error messages
- Use `notFound()` from `@tanstack/react-router` for 404 cases

### 2.6 Accessing HTTP Context

You can access the request and response objects for advanced scenarios:

```typescript
export const fetchDocs = createServerFn({ method: 'GET' })
  .validator((params: FetchDocsParams) => params)
  .handler(async ({ data: { repo, branch, filePath }, context }) => {
    // Set cache headers for CDN caching
    context.response.headers.set(
      'Cache-Control',
      'public, max-age=0, must-revalidate',
    )
    context.response.headers.set(
      'CDN-Cache-Control',
      'max-age=300, stale-while-revalidate=300',
    )

    // ... fetch logic
  })
```

---

## 3. In-Memory Caching Patterns in TanStack Start

### 3.1 Module-Level Caching

Module-level variables (const/let) provide efficient in-memory caching across requests:

```typescript
// Module-level cache for in-flight loading promises
// Prevents duplicate loads when multiple components request the same plugin
const loadingPromises: Record<
  PluginKey,
  Promise<PluginState<AnyPlugin>> | null
> = {}

// Module-level cache variables
let moduleCachedData: OpenRouterKeyInfo | null = null
let moduleLastFetchTime: number | null = null
```

**Key Points:**

- Module-level variables persist for the lifetime of the server process
- Share state across all requests
- Useful for caching data loaded from external APIs

### 3.2 Module-Level Cache with TTL Pattern

A common pattern for time-based cache invalidation:

```typescript
// Module-level cache for config to avoid recomputing on every call
let cachedConfig: Config | undefined
let cacheTimestamp: number | undefined
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export const getConfig = (): Config => {
  const now = Date.now()

  // Return cached config if still valid
  if (cachedConfig && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return cachedConfig
  }

  // Compute and cache new config
  cachedConfig = computeConfig()
  cacheTimestamp = now
  return cachedConfig
}
```

**Key Points:**

- Use a timestamp to track cache age
- Define a TTL (time-to-live) for automatic invalidation
- Return cached data if valid, otherwise recompute

### 3.3 Cache Key Pattern with Map

Use a Map for key-based caching:

```typescript
/**
 * Module-level cache for evaluator output types.
 * Key format: `${projectId}:${evaluatorSlug}`
 */
const outputTypesCache = new Map<string, Map<string, string | null>>()

export function getCachedOutputTypes(
  projectId: string,
  evaluatorSlug: string,
): Map<string, string | null> | null {
  const key = `${projectId}:${evaluatorSlug}`
  return outputTypesCache.get(key) || null
}

export function setCachedOutputTypes(
  projectId: string,
  evaluatorSlug: string,
  types: Map<string, string | null>,
): void {
  const key = `${projectId}:${evaluatorSlug}`
  outputTypesCache.set(key, types)
}
```

**Key Points:**

- Use compound keys for complex cache entries
- Map provides O(1) lookup performance
- Easy to clear specific cache entries

### 3.4 Module-Level Cache for Data Fetching

```typescript
// Module-level cache variables
let modelsCache: Array<FlattenedModel> | null = null
let cacheLoadTime: number | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function getModelsFromCache(): Promise<Array<FlattenedModel>> {
  const now = Date.now()

  // Return cached data if still valid
  if (
    modelsCache !== null &&
    cacheLoadTime !== null &&
    now - cacheLoadTime < CACHE_TTL
  ) {
    return modelsCache
  }

  // Fetch fresh data
  const response = await fetch('https://models.dev/api/json')
  const apiResponse: ModelsApiResponse = await response.json()
  modelsCache = flattenModelsData(apiResponse)
  cacheLoadTime = now

  return modelsCache
}

export function clearModelsCache(): void {
  modelsCache = null
  cacheLoadTime = null
}
```

**Key Points:**

- Check cache validity before fetching
- Update cache on fresh fetch
- Provide a function to clear cache manually

### 3.5 Performance Considerations for Large Datasets

**For 2000+ models:**

1. **Load Once:** Cache data in memory on first request, reuse for subsequent requests
2. **Lazy Initialization:** Only load data when first needed, not at startup
3. **Memory Usage:** Monitor memory usage - 2000 models should be ~1-2MB in memory
4. **TTL Strategy:** Use a reasonable TTL (e.g., 10-30 minutes) for API data
5. **Cache Invalidation:** Provide manual cache clear function for admin purposes

**Cache Size Estimation:**

- 2000 models × 27 fields × ~50 bytes per field ≈ 2.7MB (conservative estimate)
- Actual size likely smaller due to data compression and sparse fields

---

## 4. Server-Side Pagination Implementation

### 4.1 Pagination Parameters Structure

```typescript
interface PaginationParams {
  page: number // Current page number (1-based)
  limit: number // Items per page
}

interface PaginationMeta {
  page: number // Current page (1-based)
  limit: number // Items per page
  total: number // Total number of items
  totalPages: number // Total number of pages
  hasMore: boolean // Whether there are more pages
}
```

### 4.2 Calculate Pagination

**From superglue-ai/superglue:**

```typescript
export function parsePaginationParams(query: {
  page?: string
  limit?: string
}): {
  page: number
  limit: number
  offset: number
} {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1)
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit || '50', 10) || 50),
  )
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
```

**Key Points:**

- Page numbers are 1-based (not 0-based)
- Offset = (page - 1) × limit
- Clamp limit to reasonable bounds (e.g., 1-100)

### 4.3 Generate Pagination Metadata

**From daytonaio/daytona:**

```typescript
function getPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  }
}
```

**Key Points:**

- `totalPages = Math.ceil(total / limit)`
- `hasMore = page < totalPages`
- Include all metadata for client-side pagination UI

### 4.4 Apply Pagination to Data

**From linsa-io/linsa:**

```typescript
// Apply pagination to array
const start = (page - 1) * limit
const end = page * limit
const paginatedItems = allItems.slice(start, end)

return {
  items: paginatedItems,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
}
```

### 4.5 Complete Pagination Implementation

```typescript
import type { FlattenedModel } from '@/types/models'

interface GetModelsParams {
  page: number
  limit: number
  search?: string
  providers?: Array<string>
  reasoning?: boolean
  // ... other filters
}

interface GetModelsResponse {
  models: Array<FlattenedModel>
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

function applyPagination<T>(
  items: Array<T>,
  page: number,
  limit: number,
): { paginated: Array<T>; meta: GetModelsResponse['meta'] } {
  const total = items.length
  const totalPages = Math.ceil(total / limit)

  // Apply pagination
  const start = (page - 1) * limit
  const end = page * limit
  const paginated = items.slice(start, end)

  return {
    paginated,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}
```

**Key Points:**

- Use `slice()` for efficient pagination
- Return paginated items + metadata
- Metadata includes `hasMore` for infinite scroll support

---

## 5. Server-Side Filtering and Search

### 5.1 Simple Text Matching (Fastest)

For simple text search, use case-insensitive matching:

```typescript
function filterBySearch<T extends { name: string }>(
  items: Array<T>,
  searchQuery: string,
): Array<T> {
  if (!searchQuery.trim()) {
    return items
  }

  const query = searchQuery.toLowerCase()
  return items.filter((item) => item.name.toLowerCase().includes(query))
}
```

**Key Points:**

- Fastest option for simple search
- Use case-insensitive matching for better UX
- Return all items if query is empty

### 5.2 Multiple Field Text Matching

```typescript
function filterBySearch<
  T extends {
    modelName: string
    providerName: string
    modelFamily: string
  },
>(items: Array<T>, searchQuery: string): Array<T> {
  if (!searchQuery.trim()) {
    return items
  }

  const query = searchQuery.toLowerCase()
  return items.filter(
    (item) =>
      item.modelName.toLowerCase().includes(query) ||
      item.providerName.toLowerCase().includes(query) ||
      item.modelFamily.toLowerCase().includes(query),
  )
}
```

**Key Points:**

- Search across multiple fields
- OR logic (match any field)
- Case-insensitive for better UX

### 5.3 Fuse.js Fuzzy Search (More Flexible)

Fuse.js provides fuzzy matching with configurable options.

**Configuration from AFFiNE:**

```typescript
import Fuse from 'fuse.js'

const fuse = new Fuse(items, {
  keys: [
    { name: 'modelName', weight: 2.0 }, // Higher weight for name
    { name: 'providerName', weight: 1.5 },
    { name: 'modelFamily', weight: 1.0 },
  ],
  includeMatches: true,
  includeScore: true,
  ignoreLocation: true,
  threshold: 0.3, // Lower = more strict match
})

const results = fuse.search(searchQuery)
return results.map((result) => result.item)
```

**Key Points:**

- `threshold`: 0.0 = exact match, 1.0 = match anything
- `weight`: Higher values prioritize those fields
- `ignoreLocation: true`: Ignores position in string (faster)
- Return mapped items (not Fuse result objects)

### 5.4 Server-Side Fuse.js Performance Considerations

**Configuration from home-assistant/frontend:**

```typescript
const fuseOptions = {
  keys: ['modelName', 'providerName', 'modelFamily'],
  isCaseSensitive: false,
  minMatchCharLength: Math.min(searchQuery.length, 2),
  threshold: 0.2, // Stricter for better relevance
  ignoreDiacritics: true,
}

const fuse = new Fuse(allEntries, fuseOptions)
const results = fuse.search(searchQuery)
```

**Key Points:**

- `isCaseSensitive: false`: Case-insensitive search
- `minMatchCharLength`: Minimum characters to match (2 for short queries)
- `ignoreDiacritics: true`: Ignore accents/diacritics
- `threshold: 0.2`: Balanced relevance

### 5.5 Performance Comparison

| Method                      | Speed  | Flexibility | Best For                               |
| --------------------------- | ------ | ----------- | -------------------------------------- |
| Simple `includes()`         | ⚡⚡⚡ | Low         | Exact match search                     |
| Multiple field `includes()` | ⚡⚡   | Medium      | Search across name, provider, etc.     |
| Fuse.js fuzzy               | ⚡     | High        | Flexible search with relevance scoring |
| Fuse.js (strict threshold)  | ⚡⚡   | Medium      | Fast fuzzy search with good results    |

**Recommendation for Models Explorer:**

- Use **simple text matching** for initial implementation (fastest)
- Consider Fuse.js if users need fuzzy search (typos, partial matches)
- Cache Fuse.js instance for performance (one instance per server)

### 5.6 Filter by Multiple Criteria

```typescript
function filterByCriteria<
  T extends {
    providerName: string
    reasoning: boolean
    toolCall: boolean
  },
>(
  items: Array<T>,
  filters: {
    providers?: Array<string>
    reasoning?: boolean
    toolCall?: boolean
  },
): Array<T> {
  return items.filter((item) => {
    // Filter by providers (if specified)
    if (filters.providers && filters.providers.length > 0) {
      if (!filters.providers.includes(item.providerName)) {
        return false
      }
    }

    // Filter by reasoning (if specified)
    if (filters.reasoning !== undefined) {
      if (item.reasoning !== filters.reasoning) {
        return false
      }
    }

    // Filter by toolCall (if specified)
    if (filters.toolCall !== undefined) {
      if (item.toolCall !== filters.toolCall) {
        return false
      }
    }

    return true
  })
}
```

**Key Points:**

- Only apply filter if it's specified (not undefined)
- AND logic for multiple filters
- Easy to extend with additional filters

### 5.7 Combined Search and Filter

```typescript
function filterModels(
  allModels: Array<FlattenedModel>,
  params: {
    search?: string
    providers?: Array<string>
    reasoning?: boolean
    page?: number
    limit?: number
  },
): GetModelsResponse {
  let filtered = allModels

  // Apply search filter
  if (params.search) {
    filtered = filterBySearch(filtered, params.search)
  }

  // Apply provider filter
  if (params.providers && params.providers.length > 0) {
    filtered = filtered.filter((model) =>
      params.providers!.includes(model.providerName),
    )
  }

  // Apply reasoning filter
  if (params.reasoning !== undefined) {
    filtered = filtered.filter((model) => model.reasoning === params.reasoning)
  }

  // Apply pagination
  const page = params.page ?? 1
  const limit = params.limit ?? 50
  const { paginated, meta } = applyPagination(filtered, page, limit)

  return {
    models: paginated,
    meta,
  }
}
```

**Key Points:**

- Apply filters in order: search → specific filters → pagination
- Use default values for pagination
- Return both paginated results and metadata

---

## 6. Complete Implementation: `getModels` Server Function

### 6.1 Dependencies to Install

```bash
npm install zod
```

### 6.2 Complete Server Function Implementation

```typescript
// src/lib/models-api-server.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import Fuse from 'fuse.js'

import type { FlattenedModel, ModelsApiResponse } from '@/types/models'
import { flattenModelsData } from '@/lib/models-transform'

// ============================================
// Module-level cache
// ============================================
let modelsCache: Array<FlattenedModel> | null = null
let fuseCache: Fuse<FlattenedModel> | null = null
let cacheLoadTime: number | null = null

const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// ============================================
// Zod schema for input validation
// ============================================
const GetModelsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50),
  search: z.string().optional().default(''),
  providers: z.array(z.string()).optional().default([]),
  reasoning: z.boolean().optional(),
  toolCall: z.boolean().optional(),
  structuredOutput: z.boolean().optional(),
})

export type GetModelsInput = z.infer<typeof GetModelsSchema>

// ============================================
// Pagination metadata type
// ============================================
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface GetModelsResponse {
  models: Array<FlattenedModel>
  meta: PaginationMeta
}

// ============================================
// Fetch and cache models data
// ============================================
async function loadModelsData(): Promise<Array<FlattenedModel>> {
  const now = Date.now()

  // Return cached data if still valid
  if (
    modelsCache !== null &&
    cacheLoadTime !== null &&
    now - cacheLoadTime < CACHE_TTL
  ) {
    return modelsCache
  }

  // Fetch fresh data from models.dev
  const response = await fetch('https://models.dev/api/json')

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.statusText}`)
  }

  const apiResponse: ModelsApiResponse = await response.json()
  modelsCache = flattenModelsData(apiResponse)
  cacheLoadTime = now

  return modelsCache
}

// ============================================
// Get or create Fuse.js instance
// ============================================
function getFuseInstance(models: Array<FlattenedModel>): Fuse<FlattenedModel> {
  if (fuseCache !== null) {
    return fuseCache
  }

  fuseCache = new Fuse(models, {
    keys: [
      { name: 'modelName', weight: 2.0 },
      { name: 'providerName', weight: 1.5 },
      { name: 'modelFamily', weight: 1.0 },
    ],
    includeMatches: false,
    includeScore: false,
    ignoreLocation: true,
    threshold: 0.3,
    isCaseSensitive: false,
    minMatchCharLength: 2,
  })

  return fuseCache
}

// ============================================
// Apply search filter (simple or Fuse.js)
// ============================================
function filterBySearch(
  models: Array<FlattenedModel>,
  searchQuery: string,
): Array<FlattenedModel> {
  // Return all models if search query is empty
  if (!searchQuery.trim()) {
    return models
  }

  // Use Fuse.js for fuzzy search
  const fuse = getFuseInstance(models)
  const results = fuse.search(searchQuery)
  return results.map((result) => result.item)
}

// ============================================
// Apply all filters (search + criteria)
// ============================================
function applyFilters(
  models: Array<FlattenedModel>,
  input: GetModelsInput,
): Array<FlattenedModel> {
  let filtered = models

  // Apply search filter
  if (input.search.trim()) {
    filtered = filterBySearch(filtered, input.search)
  }

  // Apply provider filter
  if (input.providers && input.providers.length > 0) {
    filtered = filtered.filter((model) =>
      input.providers!.includes(model.providerName),
    )
  }

  // Apply reasoning filter
  if (input.reasoning !== undefined) {
    filtered = filtered.filter((model) => model.reasoning === input.reasoning)
  }

  // Apply toolCall filter
  if (input.toolCall !== undefined) {
    filtered = filtered.filter((model) => model.toolCall === input.toolCall)
  }

  // Apply structuredOutput filter
  if (input.structuredOutput !== undefined) {
    filtered = filtered.filter(
      (model) => model.structuredOutput === input.structuredOutput,
    )
  }

  return filtered
}

// ============================================
// Apply pagination
// ============================================
function applyPagination(
  models: Array<FlattenedModel>,
  page: number,
  limit: number,
): { paginated: Array<FlattenedModel>; meta: PaginationMeta } {
  const total = models.length
  const totalPages = Math.ceil(total / limit)

  const start = (page - 1) * limit
  const end = page * limit
  const paginated = models.slice(start, end)

  return {
    paginated,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  }
}

// ============================================
// Clear cache function (for admin/manual invalidation)
// ============================================
export function clearModelsCache(): void {
  modelsCache = null
  fuseCache = null
  cacheLoadTime = null
}

// ============================================
// Main server function
// ============================================
export const getModels = createServerFn({ method: 'GET' })
  .inputValidator(GetModelsSchema)
  .handler(async ({ data }: { data: GetModelsInput }) => {
    try {
      // Load models data (from cache or fetch fresh)
      const allModels = await loadModelsData()

      // Apply filters
      const filteredModels = applyFilters(allModels, data)

      // Apply pagination
      const { paginated, meta } = applyPagination(
        filteredModels,
        data.page,
        data.limit,
      )

      return {
        models: paginated,
        meta,
      }
    } catch (error) {
      console.error('[getModels Error]:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        input: data,
      })

      throw new Error('Failed to fetch models. Please try again.')
    }
  })
```

### 6.3 Usage in TanStack Query

```typescript
// src/components/ModelList/ModelList.tsx
import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { getModels, type GetModelsInput } from '@/lib/models-api-server'

export function ModelList() {
  const getModelsServer = useServerFn(getModels)

  const { data, isLoading, error } = useQuery({
    queryKey: ['models', { page: 1, limit: 50 }],
    queryFn: () =>
      getModelsServer({
        data: { page: 1, limit: 50, search: '', providers: [] },
      }),
  })

  if (isLoading) {
    return <div>Loading models...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data) {
    return null
  }

  return (
    <div>
      <h2>
        Models ({data.meta.total} total, page {data.meta.page} of {data.meta.totalPages})
      </h2>
      <ul>
        {data.models.map((model) => (
          <li key={model.modelId}>
            {model.modelName} - {model.providerName}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 6.4 Usage with Filters

```typescript
const { data } = useQuery({
  queryKey: [
    'models',
    { page: 1, limit: 50, search: 'gpt', providers: ['openai'] },
  ],
  queryFn: () =>
    getModelsServer({
      data: {
        page: 1,
        limit: 50,
        search: 'gpt',
        providers: ['openai'],
        reasoning: true,
      },
    }),
})
```

---

## 7. Best Practices Summary

### 7.1 Server Functions

| Practice                                      | Description                                        |
| --------------------------------------------- | -------------------------------------------------- |
| **Always validate input**                     | Use Zod schemas for type-safe validation           |
| **Handle errors gracefully**                  | Wrap external calls in try-catch, log with context |
| **Use middleware for cross-cutting concerns** | Authentication, logging, etc.                      |
| **Keep handlers focused**                     | One responsibility per function                    |
| **Document return types**                     | Use TypeScript interfaces for clear contracts      |

### 7.2 In-Memory Caching

| Practice                       | Description                                    |
| ------------------------------ | ---------------------------------------------- |
| **Use module-level variables** | Const/let at module level for persistent cache |
| **Implement TTL**              | Add timestamp for cache expiration             |
| **Provide clear function**     | Allow manual cache invalidation                |
| **Monitor memory usage**       | Large datasets should be cached carefully      |
| **Lazy initialization**        | Load data on first request, not at startup     |

### 7.3 Pagination

| Practice                         | Description                                  |
| -------------------------------- | -------------------------------------------- |
| **Use 1-based page numbers**     | More intuitive for users                     |
| **Clamp limits**                 | Prevent abuse (e.g., max 100 items per page) |
| **Return full metadata**         | Include `total`, `totalPages`, `hasMore`     |
| **Calculate offset correctly**   | `offset = (page - 1) × limit`                |
| **Use `slice()` for efficiency** | O(1) time complexity for pagination          |

### 7.4 Server-Side Search

| Practice                         | Description                                  |
| -------------------------------- | -------------------------------------------- |
| **Start with simple search**     | `includes()` is fast for exact matches       |
| **Use Fuse.js for fuzzy search** | Better UX with typos and partial matches     |
| **Cache Fuse.js instance**       | One instance per server for performance      |
| **Tune threshold carefully**     | 0.3 is a good starting point                 |
| **Search multiple fields**       | Include name, provider, family for relevance |

### 7.5 Performance Considerations

| Scenario                     | Recommendation                                       |
| ---------------------------- | ---------------------------------------------------- |
| **2000+ models**             | Use in-memory cache with 10-30 min TTL               |
| **Frequent search requests** | Cache Fuse.js instance server-side                   |
| **Large result sets**        | Apply filters before pagination                      |
| **Multiple filters**         | Filter in order: search → criteria → pagination      |
| **Memory constraints**       | Monitor cache size, implement LRU eviction if needed |

---

## 8. Verified Sources

### TanStack Start Documentation

- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- [TanStack Start Middleware](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start Error Handling](https://tanstack.com/start/latest/docs/framework/react/guide/observability)
- [TanStack Start Static Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/static-server-functions)
- [TanStack Start ISR](https://tanstack.com/start/latest/docs/framework/react/guide/isr)

### GitHub Examples

- [module-level cache examples](https://github.com/cline/cline/blob/master/webview-ui/src/components/ui/hooks/useOpenRouterKeyInfo.ts)
- [pagination patterns from superglue-ai/superglue](https://github.com/superglue-ai/superglue/blob/master/packages/core/api/response-helpers.ts)
- [Fuse.js configuration from AFFiNE](https://github.com/toeverything/AFFiNE/blob/canary/packages/frontend/core/src/modules/quicksearch/impls/collections.ts)
- [pagination metadata from daytonaio/daytona](https://github.com/daytonaio/daytona/blob/master/apps/api/src/audit/adapters/audit-typeorm.adapter.ts)
- [Fuse.js search from home-assistant/frontend](https://github.com/home-assistant/frontend/blob/dev/src/panels/config/integrations/ha-config-integrations-dashboard.ts)

---

## 9. Next Steps

1. **Install Zod:**

   ```bash
   npm install zod
   ```

2. **Create the server function file:**
   - Create `src/lib/models-api-server.ts`
   - Implement `getModels` function with caching, pagination, and search

3. **Update client-side usage:**
   - Replace direct API calls with `getModels` server function
   - Integrate with TanStack Query for state management
   - Add pagination UI controls

4. **Test and optimize:**
   - Test with different search queries
   - Test pagination with various limits
   - Monitor memory usage
   - Tune Fuse.js threshold if needed

5. **Consider enhancements:**
   - Add cache invalidation endpoint
   - Implement LRU cache for very large datasets
   - Add caching headers for CDN
   - Consider Redis for distributed caching (if using multiple servers)
