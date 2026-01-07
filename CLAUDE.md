# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Models Explorer - A React-based web application for browsing and comparing 500+ AI models from various providers. Built with the full TanStack ecosystem (Start, Router, Query, Table, Virtual) for type-safe, performant server-side rendering with 24-hour caching.

**Key Architecture Decision:** Server-side pagination, filtering, and fuzzy search via a custom API layer (`src/lib/api/models.ts`) that caches models.dev data in memory to avoid fetching the massive ~5MB API JSON on every request.

## Development Commands

```bash
# Development server (always running at http://localhost:3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview

# Lint and format (use before commits)
npm run check        # prettier --write + eslint --fix
npm run lint
npm run format
```

**Code Style Requirements:**
- Single quotes only, no semicolons, trailing commas always
- TypeScript strict mode enabled
- Array notation: `Array<Type>` NOT `Type[]`
- Path aliases: `@/*` → `src/*`

## Tech Stack

- **Framework:** React 19 + TanStack Start (SSR + server functions)
- **Build Tool:** Vite
- **Routing:** TanStack Router (file-based with URL state)
- **Data Fetching:** TanStack Query v5 with 24h caching
- **Table:** TanStack Table with manual pagination/filtering
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript (strict mode)
- **Search:** Fuse.js for fuzzy search on server

## Critical Architecture Rules

### 1. API Data Access
**NEVER fetch `https://models.dev/api.json` directly** - it's ~5MB of data. Always use the cached server API:

```typescript
// CORRECT: Use the cached server API
import { getModels, modelsQueryOptions } from '@/lib/api/models'

// WRONG: Direct fetch
fetch('https://models.dev/api.json') // DON'T DO THIS
```

The server API (`src/lib/api/models.ts`) implements:
- Module-level in-memory cache (24h TTL)
- Fuse.js fuzzy search on modelName, providerName, modelFamily
- Server-side pagination (page, limit)
- Server-side filtering (reasoning, toolCall, openWeights)

### 2. QueryClient Usage
**ALWAYS use the existing queryClient** - DO NOT create a new instance:

```typescript
// Router already provides queryClient via context
loader: async ({ deps, context }) => {
  return context.queryClient.ensureQueryData(
    modelsQueryOptions({ page: deps.page, limit: deps.limit, ... })
  )
}
```

The queryClient is configured in `src/integrations/tanstack-query/root-provider.tsx` and integrated with the router in `src/router.tsx`.

### 3. URL State Management
Pagination, search, and filters are synchronized with URL parameters for shareable links:

```typescript
// Define search params schema with Zod
const indexSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().default(''),
  reasoning: z.boolean().optional(),
  // ...
})

export const Route = createFileRoute('/')({
  validateSearch: indexSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page, /* ... */ }),
  loader: async ({ deps, context }) => {
    return context.queryClient.ensureQueryData(
      modelsQueryOptions({ page: deps.page, /* ... */ })
    )
  },
})
```

### 4. TanStack Table Integration
The table uses `manualPagination: true` and `manualFiltering: true` because operations are server-side:

```typescript
const table = useReactTable({
  data: modelsQuery.data.data,
  columns: modelColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),

  // Server-side operations
  manualPagination: true,
  rowCount: modelsQuery.data.pagination.total,
  manualFiltering: true,

  state: { pagination, sorting, rowSelection, globalFilter, columnVisibility },
  // ...
})
```

## Data Flow Diagram

```
User Request (URL: /?page=1&search=gpt&reasoning=true)
    ↓
TanStack Router (validateSearch → loaderDeps → loader)
    ↓
TanStack Query (ensureQueryData with modelsQueryOptions)
    ↓
Server Function (getModels in src/lib/api/models.ts)
    ↓
  ├─► Check module-level cache (24h TTL)
  ├─► Fetch from models.dev if cache miss (~5MB JSON)
  ├─► Transform to flattened format (flattenModelsData)
  ├─► Apply filters (Fuse.js search + boolean filters)
  └─► Apply pagination (slice)
    ↓
Return { data: FlattenedModel[], pagination: PaginationMeta }
    ↓
SSR: Server renders HTML with data
SPA: Client hydrates and caches with TanStack Query (24h staleTime)
```

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Server API (cache, search, pagination) | `src/lib/api/models.ts` |
| Data transformation | `src/lib/models-transform.ts` |
| Type definitions | `src/types/models.ts` |
| Router with QueryClient integration | `src/router.tsx` |
| QueryClient provider | `src/integrations/tanstack-query/root-provider.tsx` |
| Main route (table, search, filters) | `src/routes/index.tsx` |
| Root layout | `src/routes/__root.tsx` |

## Component Architecture

```
src/routes/index.tsx (Main page)
├── SearchBar (debounced input, synced to URL)
├── SimplifiedFilters (3 toggles: reasoning, toolCall, openWeights)
├── ColumnVisibilityToggle (27-column visibility, in-memory state)
├── ModelList (TanStack Table wrapper)
└── PaginationControls (page navigation, synced to URL)
```

## Implementation Status

**Completed Phases (8 out of 11):**
- Phase 1-8: ✅ Complete
- Phase 9: ⏳ Pending (Virtualization & Performance)
- Phase 10: ⏳ Pending (Polishing)
- Phase 11: 🔮 Optional (Comparison feature)

See `docs/implementation-phases.md` for detailed phase breakdown.

## Important Notes

- **API Sample:** Check `docs/sample-api-models-dev.json` for API structure - never fetch live API for exploration
- **Dev Server:** Always running at `http://localhost:3000` - don't start it
- **Column Count:** All 27 columns must match models.dev exactly (defined in `src/routes/index.tsx`)
- **Column Visibility:** Pure in-memory state (no URL sync, no localStorage) to avoid SSR/hydration issues
- **Filters:** Simplified approach (3 boolean toggles) instead of full filter panel
