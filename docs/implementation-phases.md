# AI Models Explorer - Implementation Phases

Tracking document for all implementation phases of the AI Models Explorer project.

## Project Overview

A React-based AI Models Explorer application that allows users to browse, search, and filter through 500+ AI models from various providers. The application uses TanStack Start for the framework, TanStack Table for data presentation, and TanStack Query for data fetching with 24-hour caching.

**Total Estimated Time:** 22-31 days (excluding Phase 10)

---

## Progress Tracking Table

| Phase | Status         | Duration | Focus Area                        | Key Deliverables                                    | Review                                                    |
| ----- | -------------- | -------- | --------------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| 1     | ✅ COMPLETED   | 2-3 days | Project Setup                     | Dependencies, folders, existing queryClient pattern | Commit: "feat: complete Phase 1 project setup"            |
| 2     | ✅ COMPLETED   | 1-2 days | TypeScript Types                  | All 27 column types defined                         | Audit: `docs/reviews/audit-models-types-phase2.md` - PASS |
| 3     | ✅ COMPLETED   | 2-3 days | API Integration                   | fetchModels server function, data transform         | QA: docs/qa/phase3-api-integration.md - PASS              |
| 3.5   | ✅ COMPLETED   | 2-3 days | Custom Server API with Pagination | Server-side pagination, search, and filtering       | QA: docs/qa/phase3-5-server-api.md - PASS                 |
| 4     | ✅ COMPLETED   | 2-3 days | Basic Table Layout                | ModelList component, 27 columns, sorting            | Commit: 4fa0940, QA: PASS, Review: PASS                   |
| 5     | ✅ COMPLETED   | 2-3 days | Pagination Controls               | Pagination controls UI with server-side integration | Commit: `feat(phase5): implement PaginationControls`      |
| 6     | ✅ COMPLETED   | 2-3 days | Search Integration                | SearchBar, globalFilter, URL sync                   | Commit: `feat(phase6): implement SearchBar`               |
| 7     | ⏳ IN PROGRESS | 3-4 days | Column Visibility                 | ColumnVisibilityToggle, URL sync                    | Started with sub-phase breakdown (7.1-7.5)                |
| 8     | ⏳ PENDING     | 3-4 days | Filter Integration                | FilterPanel, columnFilters, URL sync                | -                                                         |
| 9     | ⏳ PENDING     | 2-3 days | Virtualization & Performance      | Row virtualization, loading states                  | -                                                         |
| 10    | ⏳ PENDING     | 3-4 days | Polishing                         | Responsive design, accessibility, animations        | -                                                         |
| 11    | 🔮 OPTIONAL    | TBD      | Comparison                        | Comparison modal, side-by-side view                 | TBD                                                       |

---

## Total Progress

- **Phases Completed:** 5 out of 11
- **Progress:** ~45%
- **Current Phase:** Phase 7 - Column Visibility (Sub-Phase 7.1: Types & Constants)

---

## Phase 1: Project Setup

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

### Objectives

- Set up the development environment
- Install and configure all dependencies
- Verify existing queryClient integration
- Establish project structure

### Tasks

1. **Environment Setup**
   - Verify Node.js version compatibility
   - Check existing TanStack Start installation
   - Review current `package.json` dependencies

2. **Dependency Installation**
   - `@tanstack/react-table` for table functionality
   - `@tanstack/react-virtual` for virtualization
   - `@tanstack/react-router` (if not already installed)
   - `lucide-react` for icons
   - TypeScript types for all libraries

3. **Configuration**
   - Update `tsconfig.json` for new types
   - Verify `vite.config.ts` handles new libraries
   - Configure ESLint for new dependencies

4. **Project Structure**
   - Create component directories
   - Set up type definitions
   - Establish import aliases

### Deliverables

- Working dev server with new dependencies
- Updated `package.json` with all required dependencies
- Basic project structure in place

### Key Files

- `package.json`
- `tsconfig.json`
- `vite.config.ts`

---

## Phase 2: TypeScript Types

**Status:** ✅ COMPLETED

**Duration:** 1-2 days

### Objectives

- Define all 27 column types
- Create FlattenedModel interface
- Establish utility types

### Tasks

1. **Core Type Definitions**
   - Create `ModelCost` interface
   - Create `ModelLimits` interface
   - Create `FlattenedModel` interface

2. **Filter State Types**
   - Create `FilterState` interface

3. **URL State Types**
   - Create `UrlState` interface

### Deliverables

- Complete type definitions in `src/types/models.ts`
- Type-safe components throughout the project
- No `any` types used

### Key Files

- `src/types/models.ts`

### Review

- Audit: `docs/reviews/audit-models-types-phase2.md` - **PASS**

---

## Phase 3: API Integration

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

### Completion Notes

- **Date Completed:** December 2025
- **QA Report:** `docs/qa/phase3-api-integration.md` - PASS ✅
- **Files Created:** 4 files
  - `src/lib/models-api.ts` - Server function + query options
  - `src/lib/models-transform.ts` - Data transformation utility
  - `src/data/sample-models.ts` - 5 sample models
  - `src/routes/index.tsx` - Updated with loader and query
- **Key Achievement:** API successfully fetches and transforms nested data to flattened format with all 27 columns
- **Caching:** 24-hour staleTime configured with existing queryClient
- **Code Quality:** Zero lint errors, TypeScript strict mode compliant

### Objectives

- Implement server function for fetching models
- Create data transformation utilities
- Verify 24h caching with existing queryClient

### Tasks

1. **Server Function Implementation**
   - Create `fetchModels` server function
   - Handle API response
   - Implement error handling

2. **Data Transformation**
   - Create `flattenModelsData` utility
   - Transform nested API response to flat structure
   - Handle null/undefined values

3. **Test API Integration**
   - Verify data fetching works
   - Test error handling
   - Confirm caching with existing queryClient

### Deliverables

- Working API integration
- Data transformation utilities
- Cached data for 24 hours

### Key Files

- `src/lib/models-api.ts`
- `src/lib/models-transform.ts`

---

## Phase 3.5: Custom Server API with Pagination

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

**Completion Notes**

- **Date Completed:** December 2025
- **Commit:** 2796e63
- **QA Report:** `docs/qa/phase3-5-server-api.md` - PASS ✅
- **Research:** `docs/research/phase3-5-server-api-patterns.md`
- **Files Created:** 5 files
  - `src/lib/api/models.ts` (250+ lines) - Main server API implementation
  - `src/lib/models-transform.ts` - Data transformation utility
  - `docs/qa/phase3-5-server-api.md` - QA report
  - `docs/research/phase3-5-server-api-patterns.md` - Research document
- **Key Achievements:**
  - In-memory caching of models.dev data
  - Server-side pagination (page, limit parameters)
  - Server-side filtering (search, providers, capabilities)
  - Server-side sorting
  - Fuse.js integration for fuzzy search
  - Reduced initial load (50 rows vs 2000+)

### Focus Area

Server-side pagination, search, and filtering

### Objectives

- Create custom server API endpoint for models
- Implement in-memory caching of models.dev data
- Add server-side pagination (page, limit)
- Add server-side filtering (search, providers, capabilities)
- Add server-side sorting
- Return paginated results with metadata

### Tasks

1. **Server Function with createServerFn**
   - Create `/api/models` endpoint
   - Load models.dev JSON once (in-memory cache)
   - Transform to flattened format on server
   - Implement pagination logic (page × limit)

2. **Server-Side Filtering**
   - Implement text search on providerName + modelName
   - Implement provider filtering (multi-select)
   - Implement capability filters (reasoning, toolCall, etc.)
   - Use Fuse.js for fuzzy search on server

3. **Server-Side Sorting**
   - Sort by any field (name, cost, date, etc.)
   - Support asc/desc direction

4. **API Response Structure**

   ```typescript
   {
     data: FlattenedModel[],      // Current page of results
     pagination: {
       page: number,                // Current page number
       limit: number,               // Items per page
       total: number,               // Total matching items
       totalPages: number            // Total pages available
     }
   }
   ```

5. **Client Integration**
   - Update modelsQueryOptions to use new API
   - Pass page, limit, search, filters as params
   - Update index.tsx to use paginated data

### Deliverables

- Working `/api/models` server endpoint
- Server-side pagination, search, and filtering
- Reduced initial load (50 rows vs 2000+)
- URL parameters work correctly

### Key Files

- `src/lib/api/models.ts` (new)
- `src/lib/models-transform.ts` (move transform logic here)
- `src/routes/index.tsx` (update)

---

## Phase 4: Basic Table Layout

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

**Completion Notes**

- **Date Completed:** December 2025
- **Commit:** 4fa0940
- **QA Report:** `docs/qa/phase4-model-list.md` - PASS ✅
- **Review:** `docs/reviews/audit-phase4-model-list.md` - PASS ✅
- **Key Deliverables:**
  - ModelList component with all 27 columns
  - Column definitions with proper cell renderers
  - Sorting functionality on all columns
  - Row selection capability
  - Integration with TanStack Table

### Objectives

- Create ModelList component
- Define all 27 column definitions
- Basic table rendering without virtualization

### Tasks

1. **Column Definitions**
   - Implement all 27 columns from models.dev
   - Add proper cell renderers
   - Configure sorting and filtering

2. **Basic Table Structure**
   - Create ModelList component
   - Implement useReactTable hook
   - Render table headers and rows

3. **Test Basic Rendering**
   - Verify all 27 columns render
   - Check column alignment
   - Test sorting on all columns

### Deliverables

- Working table with all 27 columns
- Basic sorting functionality
- Type-safe column definitions

### Key Files

- `src/components/ModelList/index.ts`
- `src/components/ModelList/ModelList.tsx`

---

## Phase 5: Pagination Controls

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

### Completion Notes

- **Date Completed:** December 2025
- **Commit:** `feat(phase5): implement PaginationControls`
- **QA Report:** `docs/qa/phase5-pagination-controls.md` - PASS ✅
- **Files Created:** 2 files
  - `src/components/PaginationControls/PaginationControls.tsx` - Pagination UI component
  - `src/components/PaginationControls/index.ts` - Component exports
- **Files Modified:** 1 file
  - `src/routes/index.tsx` - Integrated pagination with server-side API
- **Key Achievements:**
  - Previous/Next navigation buttons
  - Page number display and navigation
  - "Showing X of Y results" display
  - URL synchronization (?page= and ?limit=)
  - Server-side pagination integration

### Objectives

- Create PaginationControls component
- Integrate with server-side pagination (page, limit parameters)
- Add Previous/Next navigation buttons
- Add page numbers and "Showing X of Y results" display
- Sync pagination state to URL

### Tasks

1. **PaginationControls Component**
   - Create component with Previous/Next buttons
   - Add page number display
   - Implement "Showing X of Y results" text

2. **URL Synchronization**
   - Sync page and limit to URL params
   - Handle initial state from URL
   - Update URL on page change

3. **Server Integration**
   - Connect to server-side pagination API
   - Handle page changes with data refetch
   - Manage loading states

### Deliverables

- Working pagination controls
- URL synchronization for pagination
- Server-side pagination integration
- "Showing X of Y results" display

### Key Files

- `src/components/PaginationControls/index.ts`

---

## Phase 6: Search Integration

**Status:** ✅ COMPLETED

**Duration:** 2-3 days

### Completion Notes

- **Date Completed:** December 29, 2025
- **Commit:** `feat(phase6): implement SearchBar with debounced input and URL sync`
- **QA Report:** `docs/qa/phase6-searchbar.md` - PASS ✅
- **Files Created:** 2 files
  - `src/hooks/useDebounce.ts` - Generic debounce hook with 300ms default delay
  - `src/components/SearchBar/SearchBar.tsx` - SearchBar component with debounced input
- **Files Modified:** 4 files
  - `src/hooks/index.ts` - Added export for useDebounce
  - `src/components/SearchBar/index.ts` - Added export for SearchBar
  - `src/routes/index.tsx` - Integrated SearchBar with URL sync and server-side search
  - `docs/qa/phase6-searchbar.md` - QA report
- **Key Achievements:**
  - SearchBar component with Lucide icons and clear button
  - 300ms debounced input using useDebounce hook
  - URL state synchronization (?search=)
  - Connected to Phase 3.5 server API (Fuse.js fuzzy search)
  - TanStack Table integration with manualFiltering: true
  - Proper caching with search in queryKey
  - ARIA labels for accessibility

- Implement SearchBar component
- Integrate with TanStack Table's globalFilter
- Sync search state to URL
- Add debouncing

### Tasks

1. **SearchBar Component**
   - Create SearchBar with input field
   - Add debounce hook (300ms delay)
   - Implement controlled input

2. **URL Sync**
   - Sync search state to URL params
   - Handle empty search state
   - Read initial state from URL

3. **TanStack Table Integration**
   - Pass globalFilter to table
   - Handle onGlobalFilterChange

### Deliverables

- Working search with debouncing
- URL synchronization
- Type-safe search implementation

### Key Files

- `src/components/SearchBar/index.ts`
- `src/hooks/useDebounce.ts`

---

## Phase 7: Column Visibility

**Status:** ⏳ IN PROGRESS

**Duration:** 3-4 days (broken into 5 sub-phases)

### Sub-Phase Breakdown

| Sub-Phase | Duration | Focus Area               | Status     |
| --------- | -------- | ------------------------ | ---------- |
| 7.1       | 0.5 day  | Types & Constants        | ⏳ PENDING |
| 7.2       | 1 day    | UI Component             | ⏳ PENDING |
| 7.3       | 0.5 day  | URL State Sync           | ⏳ PENDING |
| 7.4       | 0.5 day  | localStorage Persistence | ⏳ PENDING |
| 7.5       | 1 day    | Integration & Testing    | ⏳ PENDING |

---

### Sub-Phase 7.1: Type Definitions & Constants (0.5 day)

**Status:** ⏳ PENDING

**Objective:** Define all types and constants needed for column visibility

**Tasks:**

1. Create `src/types/column-visibility.ts`:
   - Define `ColumnVisibilityState` interface (Record<string, boolean>)
   - Define `ColumnVisibilityOptions` interface
   - Export constants:
     - `DEFAULT_VISIBLE_COLUMNS` array (6 default columns)
     - `ALL_COLUMNS` array with id and label for all 27 columns
     - `COLUMN_VISIBILITY_STORAGE_KEY` constant

2. Update `src/types/index.ts`:
   - Add export for new column-visibility types

**Deliverables:**

- `src/types/column-visibility.ts` with all type definitions
- Updated `src/types/index.ts` with new exports
- All 27 columns defined with correct IDs and labels

**Definition of Done:**

- TypeScript compiles without errors
- All column IDs match the actual column definitions in `src/routes/index.tsx`
- Types exported from `@/types` module

---

### Sub-Phase 7.2: ColumnVisibilityToggle Component (1 day)

**Status:** ⏳ PENDING

**Objective:** Create the UI component for toggling column visibility

**Tasks:**

1. Create `src/components/ColumnVisibilityToggle/ColumnVisibilityToggle.tsx`:
   - Dropdown component with button trigger
   - List of all 27 columns with checkboxes
   - "Show All" button to enable all columns
   - "Reset to Default" button to restore 6 default columns
   - Close on backdrop click
   - ARIA labels for accessibility
   - Use Lucide icons (Settings/Columns icon)

2. Create `src/components/ColumnVisibilityToggle/index.ts`:
   - Export ColumnVisibilityToggle component

**Deliverables:**

- Working ColumnVisibilityToggle component
- Proper TypeScript types
- ARIA attributes for accessibility
- Follows SearchBar patterns (similar structure)

**Definition of Done:**

- Component renders correctly
- All 27 columns display with checkboxes
- "Show All" and "Reset" buttons work
- Dropdown opens/closes properly
- No console errors
- Passes linting

---

### Sub-Phase 7.3: URL State Management (0.5 day)

**Status:** ⏳ PENDING

**Objective:** Implement URL synchronization for column visibility

**Tasks:**

1. Create `src/lib/url-state.ts` (or add to existing):
   - `getColumnVisibilityFromUrl(params: URLSearchParams): ColumnVisibilityState`
   - `getUrlFromColumnVisibility(visibility: ColumnVisibilityState): string`
   - Handle comma-separated column IDs in `?cols=` parameter
   - Return defaults when URL param is empty

2. Update `src/routes/index.tsx`:
   - Add `cols` to `indexSearchSchema` validation
   - Parse column visibility from URL on initial load
   - Initialize TanStack Table's `columnVisibility` state from URL

**URL Format:**

```
?cols=select,providerName,modelName,toolCall,inputCost,contextLimit
```

**Deliverables:**

- URL state parsing/syncing functions
- Updated index.tsx with URL-based column visibility
- TypeScript types for URL params

**Definition of Done:**

- Column visibility loads from URL correctly
- URL updates when columns are toggled
- Invalid column IDs in URL are handled gracefully
- Defaults apply when URL param is missing

---

### Sub-Phase 7.4: localStorage Persistence (0.5 day)

**Status:** ⏳ PENDING

**Objective:** Add localStorage for default column visibility preferences

**Tasks:**

1. Create persistence utility in `src/lib/column-visibility-persistence.ts`:
   - `saveDefaultColumnVisibility(visibility: ColumnVisibilityState): void`
   - `loadDefaultColumnVisibility(): ColumnVisibilityState | null`
   - Check for `typeof window === 'undefined'` for SSR safety

2. Update `src/routes/index.tsx`:
   - Load from localStorage when URL has no column visibility
   - Save to localStorage when user changes visibility (no URL param present)
   - Priority: URL > localStorage > hard-coded defaults

**Deliverables:**

- localStorage utility functions
- Integration with URL state logic
- SSR-safe implementation

**Definition of Done:**

- Column visibility persists across page reloads (when no URL param)
- localStorage saves when user changes visibility
- Doesn't cause SSR hydration mismatch
- Works correctly in all browsers

---

### Sub-Phase 7.5: Full Integration & Testing (1 day)

**Status:** ⏳ PENDING

**Objective:** Integrate everything into the main page and test thoroughly

**Tasks:**

1. Update `src/routes/index.tsx`:
   - Import ColumnVisibilityToggle component
   - Add `columnVisibility` state management (with useState or TanStack Table's built-in)
   - Add `getColumnVisibilityModel` to useReactTable configuration
   - Add useEffect to sync column visibility to URL
   - Add ColumnVisibilityToggle component to UI (near SearchBar)
   - Update Route.useSearch() to handle cols parameter

2. Integration with existing features:
   - Ensure column visibility works with Pagination
   - Ensure column visibility works with Search
   - Ensure column visibility doesn't break table sorting

3. Manual testing:
   - Test toggling columns on/off
   - Test URL sharing with different column sets
   - Test localStorage persistence
   - Test "Show All" and "Reset" buttons
   - Test with search and pagination active
   - Test in multiple browsers

**Deliverables:**

- Fully integrated column visibility feature
- Updated index.tsx with all features working
- ColumnVisibilityToggle rendered in UI

**Definition of Done:**

- All 27 columns can be toggled
- URL updates correctly when columns change
- localStorage saves/loads preferences
- Feature works alongside Search and Pagination
- No breaking changes to existing functionality
- Passes linting (`npm run check`)

---

### Overall Phase 7 Objectives

- Implement ColumnVisibilityToggle component
- Show/hide columns UI
- Sync column visibility to URL
- Persist defaults to localStorage

### Overall Phase 7 Deliverables

- Working column visibility toggle
- URL sync for column visibility
- localStorage for defaults
- All 27 columns can be toggled independently

### Key Files

- `src/types/column-visibility.ts`
- `src/components/ColumnVisibilityToggle/index.ts`
- `src/lib/url-state.ts`
- `src/lib/column-visibility-persistence.ts`
- `src/routes/index.tsx`

---

## Phase 8: Filter Integration

**Status:** ⏳ PENDING

**Duration:** 3-4 days

### Objectives

- Implement FilterPanel component
- Create individual filter components
- Integrate with TanStack Table's columnFilters
- Sync filter state to URL

### Tasks

1. **Filter Components**
   - ProviderFilter (multi-select)
   - CapabilityFilter (toggles for reasoning, toolCall, structuredOutput)
   - DateRangeFilter (date picker)

2. **URL State Integration**
   - Sync filters to URL params
   - Handle comma-separated values
   - Read initial state from URL

3. **TanStack Table columnFilters**
   - Implement columnFilters state
   - Pass to useReactTable
   - Handle onColumnFiltersChange

### Deliverables

- Working filter panel
- URL synchronization for all filters
- TanStack Table integration

### Key Files

- `src/components/FilterPanel/index.ts`

---

## Phase 9: Virtualization & Performance

**Status:** ⏳ PENDING

**Duration:** 2-3 days

### Objectives

- Add row virtualization with TanStack Virtual
- Optimize rendering for 500+ rows
- Test scroll performance
- Add loading/skeleton states

### Tasks

1. **Virtualization Integration**
   - Implement useVirtualizer
   - Configure estimateSize and overscan
   - Render virtualized rows

2. **Performance Optimization**
   - Memoize column definitions
   - Use useMemo for expensive computations
   - Implement proper key props

3. **Loading States**
   - Add skeleton loading component
   - Show while fetching data
   - Handle error state

### Deliverables

- Virtualized table rendering
- Smooth scrolling with 500+ rows
- Loading skeleton states

### Key Files

- `src/components/ModelList/VirtualizedModelList.tsx`

---

## Phase 10: Polishing

**Status:** ⏳ PENDING

**Duration:** 3-4 days

### Objectives

- Add responsive design
- Implement accessibility features
- Add error boundaries
- Create empty states
- Add animations/transitions

### Tasks

1. **Responsive Design**
   - Horizontal scroll for small screens
   - Mobile-friendly filter panel
   - Touch-friendly interactions

2. **Accessibility**
   - ARIA labels on all interactive elements
   - Keyboard navigation
   - Screen reader support

3. **Error Boundaries**
   - Implement ErrorBoundary component
   - Handle fetch errors gracefully
   - Retry mechanism

4. **Empty States**
   - Handle no search results
   - Handle no filter matches
   - Helpful empty state messages

5. **Animations**
   - Smooth transitions for filter changes
   - Hover effects on rows
   - Loading skeleton animations

### Deliverables

- Fully responsive application
- Accessible to all users
- Error handling and empty states
- Polished UI with animations

---

## Phase 11: Optional - Comparison

**Status:** 🔮 OPTIONAL

**Duration:** TBD (if requested)

### Objectives

- Comparison modal/panel
- Side-by-side view
- Share via URL
- Highlight differences

### Tasks

1. **Selection Mechanism**
   - Checkbox in select column
   - Max 4 models for comparison
   - Visual indicator of selected models

2. **Comparison Modal**
   - Create modal overlay
   - Implement comparison table
   - Close functionality

3. **Share via URL**
   - Generate shareable URLs
   - Parse comparison IDs from URL
   - Copy to clipboard

4. **Highlight Differences**
   - Compare values across models
   - Highlight when values differ
   - Visual diff indicators

### Deliverables

- Working comparison feature
- Shareable comparison URLs
- Visual difference highlighting

---

## Important Notes

### Critical Requirements

- **Always use existing queryClient** from `src/integrations/tanstack-query/root-provider.tsx` - DO NOT create a new queryClient instance

- **Search and filters must integrate with TanStack Table** - Use TanStack Table's built-in `globalFilter` and `columnFilters` instead of custom filtering logic

- **State Management:** Use URL State approach for search, filters, and sorting - recommended over TanStack Query for UI state

- **Complete table columns:** All 27 columns must match models.dev exactly

- **Comparison feature:** Moved to Phase 11 (optional, TBD)

### Code Style Requirements

| Rule            | Convention                 |
| --------------- | -------------------------- |
| Quotes          | Single quotes `'` only     |
| Semicolons      | Never use                  |
| Trailing commas | Always use                 |
| TypeScript      | Strict mode enabled        |
| Array notation  | `Array<Type>` NOT `Type[]` |
| Path aliases    | `@/*` → `src/*`            |

### Key File References

| Component   | Location                                            |
| ----------- | --------------------------------------------------- |
| queryClient | `src/integrations/tanstack-query/root-provider.tsx` |
| Types       | `src/types/models.ts`                               |
| Router      | `src/router.tsx`                                    |
| Demo Routes | `src/routes/demo/`                                  |

### Implementation Guidelines

- Break each phase into 2-4 day increments
- Deep research: Understand all TanStack libraries before implementation
- Test each phase thoroughly before moving to the next
- Document any deviations from the spec
- Keep the document updated as phases progress

---

_Last Updated: December 30, 2025_
_Document Owner: Technical Writer_
_Source: `docs/spec/models-explorer.md` Section 11_
