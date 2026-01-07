# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Models Explorer - A React-based web application for browsing and comparing 500+ AI models from various providers. Built with the full TanStack ecosystem (Start, Router, Query, Table, Virtual) for type-safe, performant server-side rendering with 24-hour caching.

**Key Architecture Decision:** Server-side pagination, filtering, and fuzzy search via a custom API layer (`src/lib/models.ts`) that uses Netlify Durable Cache to persist responses across cold starts, avoiding repeated 5MB API fetches from models.dev.

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

## Issue Tracker

This project uses **beads** for issue tracking (not GitHub Issues). Use `beads` skill to understand how it works. Quick commands:

```bash
bd ready --json                                                                 # Find available work
bd create "Issue title" -t bug|feature|task|epic -p 0-4 -d "Description" --json # Create new issue
bd show <id> [<id>...] --json                                                   # Get issue details (supports multiple IDs)
bd update <id> [<id>...] --status in_progress --json                            # Update one or more issues
bd close <id> [<id>...] --reason "Done" --json                                  # Complete work (supports multiple IDs)
bd reopen <id> [<id>...] --reason "Reopening" --json                            # Reopen closed issues (supports multiple IDs)
bd sync                                                                         # Sync with git
```

## Worktree Manager

- Use `git-worktree-claude` skill for managing git worktree

## Session Completion Workflow

**MANDATORY:** When ending a work session, you MUST push all changes to remote.

1. File issues for remaining work (via `bd`)
2. Run quality gates: `npm run lint && npm run check-types`
3. Update issue status via `bd`
4. Push to remote:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. Verify: All changes committed AND pushed

## Critical Architecture Rules

### 1. API Data Access
**NEVER fetch `https://models.dev/api.json` directly** - it's ~5MB of data. Always use the cached server API:

```typescript
// CORRECT: Use the cached server API
import { getModels, modelsQueryOptions } from '@/lib/models'

// WRONG: Direct fetch
fetch('https://models.dev/api.json') // DON'T DO THIS
```

The server API (`src/lib/models.ts`) implements:
- **Dual-layer caching:** Netlify Durable Cache (persists across cold starts) + module-level in-memory cache (24h TTL)
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

### 5. Netlify Durable Cache
Server functions return `Response` objects with Netlify Durable Cache headers to persist data across cold starts:

```typescript
export const getModels = createServerFn({ method: 'GET', response: 'raw' })
  .handler(async () => {
    const data = await fetchData()
    return new Response(JSON.stringify(data), {
      headers: {
        'Netlify-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=86400, durable',
      },
    })
  })
```

**Key Points:**
- `response: 'raw'` enables custom Response objects with cache headers
- `durable` flag persists responses across serverless cold starts in Netlify's object storage
- Manual JSON serialization/deserialization required in queryFn (see `modelsQueryOptions` in `src/lib/models.ts`)
- Error responses must NOT include cache headers (use `Cache-Control: no-store`)
- Cache strategy: 60s edge cache, 24h stale-while-revalidate for optimal performance

**Performance Impact:**
- Cold starts: 3-5s → 100-200ms (15-30x faster)
- Module-level cache still provides in-memory caching for warm function instances
- Durable cache survives Netlify Function restarts (AWS Lambda cold starts)

## Data Flow Diagram

```
User Request (URL: /?page=1&search=gpt&reasoning=true)
    ↓
TanStack Router (validateSearch → loaderDeps → loader)
    ↓
TanStack Query (ensureQueryData with modelsQueryOptions)
    ↓
Server Function (getModels in src/lib/models.ts)
    ↓
  ├─► Check Netlify Durable Cache (persists across cold starts)
  ├─► Check module-level cache (24h TTL, warm instances only)
  ├─► Fetch from models.dev if cache miss (~5MB JSON)
  ├─► Transform to flattened format (flattenModelsData)
  ├─► Apply filters (Fuse.js search + boolean filters)
  └─► Apply pagination (slice)
    ↓
Return Response with Netlify-CDN-Cache-Control headers
    ↓
Netlify Edge: Cache response with Durable Cache (24h stale-while-revalidate)
    ↓
SSR: Server renders HTML with data
SPA: Client hydrates and caches with TanStack Query (24h staleTime)
```

## Key Files Reference

| Purpose | Location |
|---------|----------|
| Server API (cache, search, pagination) | `src/lib/models.ts` |
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
