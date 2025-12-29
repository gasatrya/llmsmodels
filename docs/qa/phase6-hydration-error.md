# Phase 6 Hydration Error Investigation Report

## Summary

Hydration error occurs when navigating directly to URLs with search parameters (`?search=Mercury` or `?page=2&limit=50`). The root cause is that `useSearchParams` hook in `src/routes/index.tsx` initializes state with default values on the server, but reads actual URL parameters on the client, causing a mismatch.

## Test Results

### Test Scenarios

| URL                                                     | Hydration Error | Notes                           |
| ------------------------------------------------------- | --------------- | ------------------------------- |
| `http://localhost:3000/`                                | ❌ No           | Works correctly                 |
| `http://localhost:3000/?page=2&limit=50`                | ✅ Yes          | Pagination mismatch             |
| `http://localhost:3000/?search=Mercury`                 | ✅ Yes          | SearchBar clear button mismatch |
| `http://localhost:3000/?page=1&limit=50&search=Mercury` | ✅ Yes          | Both issues present             |

## Hydration Error Details

### Error 1: SearchBar Clear Button Mismatch

**Location:** `src/components/SearchBar/SearchBar.tsx:53:9`

**Error Message:**

```
Hydration failed because to server rendered HTML didn't match to client.
+ <button
+   onClick={function}
+   className="absolute right-2 text-gray-400 hover:text-gray-600"
+   aria-label="Clear search"
+ >
```

**Root Cause:**
The SearchBar conditionally renders a clear button based on `inputValue` state:

```tsx
{inputValue && (
  <button onClick={handleClear} ...>
    <X className="w-4 h-4" aria-hidden="true" />
  </button>
)}
```

On the server, `useSearchParams` returns:

```tsx
{ page: '1', limit: '50', search: '' }  // Default values on server
```

This causes:

1. Server renders SearchBar with `value=""`
2. Clear button is NOT rendered
3. HTML sent to client without clear button
4. On client, `useSearchParams` reads from `window.location.search`
5. Gets `search = "Mercury"`
6. Triggers re-render with `value="Mercury"`
7. Clear button IS rendered
8. **Hydration mismatch!**

### Error 2: PaginationControls Row Count Mismatch

**Location:** `src/components/PaginationControls/PaginationControls.tsx:49:15`

**Error Message:**

```
+ 51
- 1
```

**Root Cause:**
The `PaginationControls` component calculates `startRow` based on pagination state:

```tsx
const startRow = pagination.pageIndex * pageSize + 1
```

On the server with URL `?page=2&limit=50`:

1. `useSearchParams` returns default values `{ page: '1', limit: '50', search: '' }`
2. `pagination` state initialized to `{ pageIndex: 0, pageSize: 50 }`
3. `startRow = 0 * 50 + 1 = 1`
4. Server renders "Showing 1 to 50 of 1,923 results"
5. On client, `useSearchParams` reads actual URL `{ page: '2', limit: '50', search: '' }`
6. Triggers re-render
7. `startRow = 1 * 50 + 1 = 51`
8. Client expects "Showing 51 to 100 of 1,923 results"
9. **Hydration mismatch!**

## Root Cause Analysis

The fundamental issue is in the `useSearchParams` hook implementation in `src/routes/index.tsx` (lines 362-388):

```tsx
function useSearchParams(): {
  page: string | undefined
  limit: string | undefined
  search: string | undefined
} {
  const [params, setParams] = React.useState(() => {
    if (typeof window === 'undefined')
      return { page: '1', limit: '50', search: '' } // PROBLEM: Defaults on server
    const urlParams = new URLSearchParams(window.location.search)
    return {
      page: urlParams.get('page') ?? '1',
      limit: urlParams.get('limit') ?? '50',
      search: urlParams.get('search') ?? '',
    }
  })

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setParams({
      page: urlParams.get('page') ?? '1',
      limit: urlParams.get('limit') ?? '50',
      search: urlParams.get('search') ?? '',
    })
  }, [])

  return params
}
```

**Problems:**

1. Server-side rendering always uses default values
2. TanStack Start should provide search params via route context
3. The custom hook is not needed - TanStack Router has built-in `useSearch()`
4. The `useEffect` updates state after mount, causing re-renders

## Severity Assessment

**Level:** CRITICAL

**Rationale:**

- Blocks direct URL navigation with parameters
- Affects SEO and shareability of filtered/searched URLs
- Violates SSR contract (server HTML ≠ client HTML)
- All search-based functionality breaks on direct navigation

## Recommended Fix

### Option 1: Use TanStack Router's Built-in `useSearch()` Hook (Recommended)

TanStack Start provides `useSearch()` hook that properly handles SSR:

```tsx
import { useSearch } from '@tanstack/react-router'

function IndexPage() {
  const search = useSearch({
    strict: false,
  })

  // Access params directly:
  const page = Number(search.page ?? 1)
  const limit = Number(search.limit ?? 50)
  const searchQuery = search.search ?? ''

  // Initialize state from URL params
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize: limit,
  })

  const [globalFilter, setGlobalFilter] = useState<string>(searchQuery)
}
```

### Option 2: Fix Custom `useSearchParams` Hook

If keeping to custom hook:

```tsx
function useSearchParams() {
  const [params, setParams] = React.useState(() => {
    // On server, return default values (will be updated by loader)
    if (typeof window === 'undefined') {
      return { page: '1', limit: '50', search: '' }
    }

    const urlParams = new URLSearchParams(window.location.search)
    return {
      page: urlParams.get('page') ?? '1',
      limit: urlParams.get('limit') ?? '50',
      search: urlParams.get('search') ?? '',
    }
  })

  // Remove this useEffect - it causes to mismatch
  // React.useEffect(() => { ... }, [])

  return params
}
```

Then update to route loader to properly initialize data from URL params:

```tsx
export const Route = createFileRoute('/')({
  loader: async ({ search, location }) => {
    const page = Number(search.page ?? 1)
    const limit = Number(search.limit ?? 50)
    const searchQuery = search.search ?? ''

    const data = await getModels({
      data: { page, limit, search: searchQuery },
    })

    return {
      params: { page, limit, search: searchQuery },
      data,
    }
  },
  component: IndexPage,
})
```

### Option 3: Fix SearchBar to not rely on conditional rendering

Update SearchBar to always render the clear button but hide it with CSS:

```tsx
<button
  onClick={handleClear}
  className={`absolute right-2 text-gray-400 hover:text-gray-600 ${!inputValue ? 'invisible' : ''}`}
  aria-label="Clear search"
>
  <X className="w-4 h-4" aria-hidden="true" />
</button>
```

## Additional Issues Found

1. **PaginationControls line 45:** Typo `aria-live="polite"` is missing closing `t`
2. **PaginationControls line 111:** Typo `aria-live="polite"` is missing closing `t`

## Console Output

### Error 1 (SearchBar)

```
Error: Hydration failed because to server rendered HTML didn't match to client.
  at throwOnHydrationMismatch (react-dom_client.js:3920:13)
  at beginWork (react-dom_client.js:8694:196)
  ...
```

### Error 2 (Pagination)

```
Error: Hydration failed because to server rendered text didn't match to client.
  at throwOnHydrationMismatch (react-dom_client.js:3920:13)
  at prepareToHydrateHostInstance (react-dom_client.js:3994:23)
  ...
```

## Screenshots

- `hydration-error-mercury-search.png` - Shows to search input with hydration error
- SearchBar missing clear button on server render
- Clear button appears on client hydration

## Conclusion

The hydration error is caused by to custom `useSearchParams` hook that initializes state differently on server vs client. The recommended fix is to use TanStack Router's built-in `useSearch()` hook which is designed to handle SSR correctly.

**Status:** BLOCKING - Must be fixed before production deployment.

---

## Post-Fix Verification

**Test Date:** December 30, 2025
**Fix:** Replaced custom `useSearchParams` with TanStack Router's `Route.useSearch()` (SSR-safe)

### Test Results

| URL                                                     | Hydration Error | Notes              |
| ------------------------------------------------------- | --------------- | ------------------ |
| `http://localhost:3000/`                                | ❌ No           | Works correctly ✅ |
| `http://localhost:3000/?page=2&limit=50`                | ❌ No           | Works correctly ✅ |
| `http://localhost:3000/?search=Mercury`                 | ❌ No           | Works correctly ✅ |
| `http://localhost:3000/?page=1&limit=50&search=Mercury` | ❌ No           | Works correctly ✅ |

### Navigation Flow Test

- ✅ Search bar typing triggers search correctly
- ✅ URL updates to `?search=Mercury`
- ✅ Search bar shows "Mercury" with clear button visible
- ✅ Pagination navigation works
- ✅ URL updates to `?search=Mercury&page=2`
- ✅ Console clean (0 errors, 0 warnings)

### Detailed Test Observations

**Test 1 - Base URL (baseline):**

- Loaded successfully: `http://localhost:3000/`
- URL normalized to: `?page=1&limit=50&search=`
- Displays: "Showing 1 to 50 of 1,924 results"
- Pagination: "Page 1 of 39"
- Console: Clean (only React DevTools info message)

**Test 2 - Pagination only:**

- Loaded successfully: `?page=2&limit=50`
- URL normalized to: `?page=2&limit=50&search=`
- Displays: "Showing 51 to 100 of 1,924 results"
- Pagination: "Page 2 of 39"
- Console: Clean (no hydration errors)

**Test 3 - Search only:**

- Loaded successfully: `?search=Mercury`
- URL normalized to: `?search=Mercury&page=1&limit=50`
- Search bar shows: "Mercury" with clear button visible
- Displays: "Browse and compare 2 AI models" (filtered)
- Table shows: 2 Mercury models (Inception Mercury, Inception Mercury Coder)
- Pagination: "Showing 1 to 2 of 2 results", "Page 1 of 1"
- Console: Clean (no hydration errors)

**Test 4 - Combined pagination and search:**

- Loaded successfully: `?page=1&limit=50&search=Mercury`
- Search bar shows: "Mercury" with clear button visible
- Displays: "Browse and compare 2 AI models" (filtered)
- Table shows: 2 Mercury models
- Pagination: "Showing 1 to 2 of 2 results", "Page 1 of 1"
- Console: Clean (no hydration errors)

**Test 5 - Navigation flow (interactive):**

- Started at: `http://localhost:3000/`
- Typed "Mercury" in search bar
- After 1 second (debounce), URL updated to: `?page=1&limit=50&search=Mercury`
- Search bar displays: "Mercury" with clear button visible
- Results filtered: 2 models shown
- Header updated: "Browse and compare 2 AI models"
- Console: Clean (no hydration errors)

### Conclusion

**Status:** PASS ✅
**Fix Verified:** All hydration errors are resolved. Direct URL navigation with search parameters works as expected.

The fix successfully replaced the custom `useSearchParams` hook with TanStack Router's SSR-safe `Route.useSearch()` hook. All 4 direct navigation scenarios now work without hydration errors. The navigation flow (interactive search typing and pagination) also works correctly with URL state synchronization.

### Fix Applied

**File Modified:** `src/routes/index.tsx`

**Changes:**

```tsx
// Before (lines 362-388):
function useSearchParams() {
  const [params, setParams] = React.useState(() => {
    if (typeof window === 'undefined')
      return { page: '1', limit: '50', search: '' } // PROBLEM: Defaults on server
    const urlParams = new URLSearchParams(window.location.search)
    return {
      page: urlParams.get('page') ?? '1',
      limit: urlParams.get('limit') ?? '50',
      search: urlParams.get('search') ?? '',
    }
  })

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setParams({
      page: urlParams.get('page') ?? '1',
      limit: urlParams.get('limit') ?? '50',
      search: urlParams.get('search') ?? '',
    })
  }, [])

  return params
}

// After (lines 384-385):
const search = Route.useSearch()
const navigate = Route.useNavigate()
```

The new implementation uses TanStack Router's built-in `Route.useSearch()` hook which:

- Is SSR-safe and designed for server-side rendering
- Automatically syncs with URL parameters
- Provides type safety via `validateSearch` schema
- Eliminates the need for custom state management
- Removes hydration mismatches

**Status:** READY FOR PRODUCTION
