# Filter Functionality Bugs - Comprehensive Report

**Date:** 2025-12-30
**Tester:** QA Specialist
**Application:** AI Models Explorer (http://localhost:3000)
**Components Tested:** FilterPanel, ProviderFilter, CapabilityFilter

---

## Executive Summary

Four critical bugs identified in the filter functionality that affect user experience and data consistency:

1. **Checkbox filter URL parameter handling** - Parameter not removed on uncheck
2. **Provider search filtering** - Search returns no results for valid providers
3. **Limited provider count** - Only 5 providers shown (limitation)
4. **Provider inconsistency across pagination** - Provider list changes when navigating pages

---

## Bug 1: Checkbox Filter URL Parameter Handling

### Severity

**HIGH** - Causes incorrect filtering behavior

### Description

When unchecking capability filter checkboxes (Reasoning, Tool Call, Structured Output), the URL parameter is set to `false` instead of being removed entirely. This causes the filter to actively search for models where the capability is `false` rather than removing the filter constraint.

### Reproduction Steps

1. Navigate to `http://localhost:3000`
2. Click on the "Reasoning" checkbox in the Capabilities filter
3. Observe URL changes to: `...&reasoning=true`
4. Results show 891 models (models with reasoning=true)
5. Click on the "Reasoning" checkbox again to uncheck it
6. Observe URL changes to: `...&reasoning=false`
7. Results show 1,036 models (models with reasoning=false)

### Expected Behavior

- When unchecking a capability filter, the URL parameter should be **removed** from the URL
- URL should change from: `?reasoning=true` to: `?` (no reasoning parameter)
- Results should show all models (1,927 total) when no capability filters are active

### Actual Behavior

- URL parameter remains with `false` value: `?reasoning=false`
- Results filter for models where reasoning=false (1,036 models)
- User must manually edit URL to remove the parameter or use "Reset Capabilities" button

### Root Cause Analysis

Location: `src/routes/index.tsx` lines 520-531

The filter update effect updates the URL with the exact filter state, including `false` values:

```typescript
// Update URL when filters change
useEffect(() => {
  navigate({
    search: {
      ...search,
      providers: filters.providers,
      reasoning: filters.capabilities.reasoning, // Passes false instead of omitting
      toolCall: filters.capabilities.toolCall,
      structuredOutput: filters.capabilities.structuredOutput,
    },
  })
}, [filters, navigate, search])
```

### Impact

- Users cannot simply uncheck a filter to remove it
- Confusing UX - unchecking creates a negative filter instead of no filter
- Incorrect filtering results
- Need to use "Reset Capabilities" button to clear all capability filters

### Recommended Fix

Filter out undefined/falsy values from the URL parameters:

```typescript
useEffect(() => {
  const searchParams: Record<string, unknown> = {
    ...search,
    providers: filters.providers.length > 0 ? filters.providers : undefined,
  }

  // Only add capability params if they are true
  if (filters.capabilities.reasoning === true) {
    searchParams.reasoning = true
  }
  if (filters.capabilities.toolCall === true) {
    searchParams.toolCall = true
  }
  if (filters.capabilities.structuredOutput === true) {
    searchParams.structuredOutput = true
  }

  navigate({ search: searchParams })
}, [filters, navigate, search])
```

---

## Bug 2: Provider Search Filtering

### Severity

**MEDIUM** - Search feature is non-functional

### Description

The search input in ProviderFilter does not correctly filter the provider list. When typing a valid provider name (e.g., "nvidia"), the search returns "No providers found" even though there are models from that provider in the current results.

### Reproduction Steps

1. Navigate to `http://localhost:3000`
2. Type "nvidia" in the "Search providers..." input box
3. Observe message: "No providers found"

### Expected Behavior

- The provider list should filter to show only matching providers
- Searching "nvidia" should show the "Nvidia" provider checkbox
- Partial matches should work (e.g., "n" should match Nvidia, Moonshot AI, etc.)

### Actual Behavior

- "No providers found" message appears
- No providers are shown in the list
- Search appears to be non-functional

### Root Cause Analysis

Location: `src/components/FilterPanel/ProviderFilter.tsx` lines 19-25

The filtering logic appears correct:

```typescript
const filteredProviders = useMemo(() => {
  if (!searchQuery.trim()) {
    return providers
  }
  const query = searchQuery.toLowerCase()
  return providers.filter((p) => p.name.toLowerCase().includes(query))
}, [providers, searchQuery])
```

However, the issue is likely that **only 5 providers are available** in the `providers` array (see Bug 3), and these 5 providers may not include "Nvidia" depending on the current page results.

### Impact

- Users cannot quickly find specific providers
- Search feature is completely non-functional in practice
- Poor UX for applications with many providers

### Recommended Fix

1. Fix Bug 3 first - load all providers from the API, not just from current page
2. Verify the search logic handles case-insensitive matching correctly
3. Consider using fuzzy matching (already imported Fuse.js in the project)

---

## Bug 3: Only 5 Providers Shown

### Severity

**MEDIUM** - Severe limitation in filtering capabilities

### Description

The provider filter only shows 5 providers at a time. This is likely an arbitrary limitation or an unintended side effect of the provider list extraction logic.

### Reproduction Steps

1. Navigate to `http://localhost:3000`
2. Open the Provider Filter section
3. Count the providers listed

**Page 1 providers (with reasoning=false):**

- Alibaba
- Moonshot AI
- Moonshot AI (China)
- Ollama Cloud
- xAI

**Page 2 providers (with reasoning=false):**

- Nvidia
- Vultr
- xAI
- Ollama Cloud

### Expected Behavior

- All available providers from the API should be listed
- The full provider list should be available regardless of pagination
- Users should be able to filter by any provider in the database

### Actual Behavior

- Only 5 providers are shown
- The provider list varies depending on which page is being viewed
- Users cannot filter by providers that aren't on the current page

### Root Cause Analysis

Location: `src/routes/index.tsx` lines 536-548

The `uniqueProviders` is derived from the **current page's models data**:

```typescript
// Get unique providers from models data
const uniqueProviders = useMemo(() => {
  const providersMap = new Map<string, { id: string; name: string }>()
  modelsQuery.data.data.forEach((model) => {
    // Only iterates current page!
    const id = model.providerName
    if (!providersMap.has(id)) {
      providersMap.set(id, { id, name: model.providerName })
    }
  })
  return Array.from(providersMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}, [modelsQuery.data])
```

This only extracts providers from the `modelsQuery.data.data` array, which contains only the current page's 50 models (or however many on the page).

### Impact

- Users cannot filter by all available providers
- The provider list is fragmented across different pages
- Poor UX - must navigate through pages to find specific providers
- Inconsistent filtering experience

### Recommended Fix

Load the complete list of all providers from a separate API call or extract them from the full dataset before pagination:

```typescript
// Option 1: Extract from all models before pagination
const allProviders = useMemo(() => {
  const providersMap = new Map<string, { id: string; name: string }>()
  modelsQuery.data.allModels?.forEach((model) => {
    // Use full dataset
    const id = model.providerName
    if (!providersMap.has(id)) {
      providersMap.set(id, { id, name: model.providerName })
    }
  })
  return Array.from(providersMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}, [modelsQuery.data])

// Option 2: Create a dedicated API endpoint for providers
const { data: allProviders } = useQuery({
  queryKey: ['providers'],
  queryFn: () => fetch('/api/providers').then((r) => r.json()),
  staleTime: 24 * 60 * 60 * 1000, // 24 hours
})
```

---

## Bug 4: Provider List Changes on Pagination

### Severity

**MEDIUM** - Inconsistent filtering across pages

### Description

The list of available providers in the filter panel changes when navigating to different pages. This is because providers are extracted from the current page's model results rather than the complete dataset.

### Reproduction Steps

1. Navigate to `http://localhost:3000`
2. Observe providers on Page 1:
   - Alibaba
   - Moonshot AI
   - Moonshot AI (China)
   - Ollama Cloud
   - xAI
3. Click "Go to next page" button
4. Observe providers on Page 2:
   - Nvidia
   - Vultr
   - xAI
   - Ollama Cloud
5. Notice the provider list has changed (Nvidia and Vultr added, some removed)

### Expected Behavior

- The provider list should remain **consistent** across all pages
- All available providers should be shown regardless of which page is being viewed
- Pagination should only affect the model results table, not the filter options

### Actual Behavior

- Provider list changes based on which models are on the current page
- Some providers appear/disappear when navigating pages
- Confusing UX - the filter options change under the user's feet

### Root Cause Analysis

Same as Bug 3 - the `uniqueProviders` is derived from `modelsQuery.data.data` which only contains the current page's models:

```typescript
const uniqueProviders = useMemo(() => {
  const providersMap = new Map<string, { id: string; name: string }>()
  modelsQuery.data.data.forEach((model) => {
    // Only current page data!
    const id = model.providerName
    if (!providersMap.has(id)) {
      providersMap.set(id, { id, name: model.providerName })
    }
  })
  return Array.from(providersMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}, [modelsQuery.data])
```

### Impact

- Inconsistent filtering experience
- Users cannot see all providers at once
- Confusing UX - providers appear/disappear during navigation
- Makes it difficult to build reliable filter queries

### Recommended Fix

Same as Bug 3 - load the complete list of providers independently of pagination.

---

## Testing Evidence

### Screenshots

- `.playwright/filter-bug-evidence-page2.png` - Shows provider list on Page 2 (Nvidia, Vultr, xAI, Ollama Cloud)

### URL Parameter Behavior

| Action            | URL                                   | Result Count |
| ----------------- | ------------------------------------- | ------------ |
| Initial load      | `?page=1&limit=50`                    | 1,927        |
| Check Reasoning   | `?page=1&limit=50&reasoning=true`     | 891          |
| Uncheck Reasoning | `?page=1&limit=50&reasoning=false` ❌ | 1,036        |
| **Expected**      | `?page=1&limit=50`                    | **1,927**    |

### Provider List Inconsistency

| Page | Providers                                                    |
| ---- | ------------------------------------------------------------ |
| 1    | Alibaba, Moonshot AI, Moonshot AI (China), Ollama Cloud, xAI |
| 2    | Nvidia, Vultr, xAI, Ollama Cloud                             |

---

## Related Files

### Source Files

- `src/routes/index.tsx` - Main page component with filter logic
- `src/components/FilterPanel/FilterPanel.tsx` - Filter panel container
- `src/components/FilterPanel/ProviderFilter.tsx` - Provider filtering component
- `src/components/FilterPanel/CapabilityFilter.tsx` - Capability checkboxes
- `src/lib/api/models.ts` - API data fetching and filtering logic
- `src/types/filters.ts` - Filter state types

### Configuration

- `src/routes/index.tsx` - Route search schema (lines 30-40)
- Search params use `z.boolean().optional()` for capability filters

---

## Priority Recommendations

### Immediate Fixes (P0 - Critical)

1. **Bug 1:** Fix URL parameter handling to remove parameters instead of setting to `false`
   - Impact: HIGH - Users cannot correctly use filters
   - Complexity: LOW - Simple conditional logic change

### High Priority (P1)

2. **Bug 3 & 4:** Load all providers from the complete dataset, not just current page
   - Impact: MEDIUM-HIGH - Severe limitation in filtering
   - Complexity: MEDIUM - Requires API endpoint change or data structure change

### Medium Priority (P2)

3. **Bug 2:** Verify and test provider search functionality after Bug 3 is fixed
   - Impact: MEDIUM - Nice-to-have feature
   - Complexity: LOW - Search logic exists, just needs data

---

## Additional Observations

1. **The 5-provider limit appears to be a side effect** - The code doesn't explicitly limit to 5, but since it only processes the current page's 50 models, and models are often grouped by provider, it naturally caps at the providers present on that page.

2. **API caching strategy** - The `loadModelsData()` function uses a 24-hour cache. This means provider lists won't update even if the API data changes.

3. **Fuse.js not used for provider search** - The project imports Fuse.js for fuzzy search on model names, but the provider search uses simple `includes()` matching.

4. **Reset capabilities button works** - The "Reset Capabilities" button correctly clears all capability filters and removes URL parameters, proving the proper behavior is achievable.

---

## Test Environment

- **Browser:** Chrome (via Playwright)
- **URL:** http://localhost:3000
- **Date:** 2025-12-30
- **Total Models in Database:** 1,927

---

## Conclusion

All four bugs have been verified and documented. The root causes are primarily architectural:

- Capability filters pass `false` values to URL instead of omitting them
- Provider list is extracted from paginated data instead of the full dataset

The recommended fixes address the root causes and will significantly improve the user experience of the filtering system.
