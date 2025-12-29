# Phase 6 Search Functionality Issue - QA Report

**Date:** 2025-12-29
**Tester:** QA Specialist
**Test Type:** Functional Testing with Playwright
**Test Environment:** http://localhost:3000 (Development Server)

---

## Executive Summary

**Status:** ❌ FAIL - Critical Bug Found

The search functionality for "Mercury Coder" is **NOT working correctly**. While the backend API correctly returns 1 result and the pagination component displays the correct count, the table displays 6 rows instead of 1, showing stale/incorrect data from previous searches.

---

## Test Summary

### What Was Tested

1. Navigate to http://localhost:3000
2. Locate the SearchBar input field
3. Type "Mercury Coder" into the search field
4. Wait for debounced search to complete (300ms delay)
5. Verify the results displayed in the table
6. Check URL parameter state
7. Verify pagination info

### What Was Observed

#### 1. Search Input & URL State ✅ WORKING

- **Input Value:** "Mercury Coder" (correctly typed)
- **URL:** `http://localhost:3000/?page=1&limit=50&search=Mercury+Coder`
- **URL Parameter:** `search=Mercury+Coder` ✅ Correctly encoded and synced

#### 2. Backend API ✅ WORKING

- **API Endpoint:** `/_serverFn/...` (Phase 3.5 Server Function)
- **Search Parameter:** Correctly sent as "Mercury Coder"
- **Response Status:** 200 OK
- **Response Data:** Returns 1 result (Inception Mercury Coder)
- **Filtering:** Server-side Fuse.js fuzzy search is working correctly

#### 3. Pagination Display ⚠️ PARTIALLY WORKING

- **Pagination Text:** "Showing 1 to 1 of 1 results"
- **Interpretation:** Backend knows there's only 1 result
- **Issue:** This contradicts the actual table display (shows 6 rows)

#### 4. Table Display ❌ FAILING

- **Expected Rows:** 1 (Inception Mercury Coder)
- **Actual Rows:** 6 (1 correct + 5 incorrect)
- **Models Displayed:**
  1. Moonshot AI (China) Kimi K2 Thinking Turbo ❌ (incorrect)
  2. Moonshot AI (China) Kimi K2 Thinking ❌ (incorrect)
  3. Moonshot AI (China) Kimi K2 0905 ❌ (incorrect)
  4. Moonshot AI (China) Kimi K2 0711 ❌ (incorrect)
  5. Moonshot AI (China) Kimi K2 Turbo ❌ (incorrect)
  6. Inception Mercury Coder ✅ (correct - only this should be shown)

---

## Actual Behavior

```javascript
{
  url: "http://localhost:3000/?page=1&limit=50&search=Mercury+Coder",
  searchValue: "Mercury Coder",
  paginationText: "Showing 1 to 1 of 1 results",
  rowCount: 6, // ❌ Should be 1
  modelNames: [
    "Moonshot AI (China) Kimi K2 Thinking Turbo...",
    "Moonshot AI (China) Kimi K2 Thinking...",
    "Moonshot AI (China) Kimi K2 0905...",
    "Moonshot AI (China) Kimi K2 0711...",
    "Moonshot AI (China) Kimi K2 Turbo...",
    "Inception Mercury Coder..." // ✅ Only this should appear
  ]
}
```

---

## Expected Behavior

When searching for "Mercury Coder":

- **URL:** `http://localhost:3000/?page=1&limit=50&search=Mercury+Coder` ✅
- **Table Rows:** 1 ✅
- **Model Displayed:** "Inception Mercury Coder" ✅
- **Pagination:** "Showing 1 to 1 of 1 results" ✅

---

## Root Cause Analysis

### Issue Identified: React Key Duplication Bug

**Location:** `src/routes/index.tsx`, line 454

**Problematic Code:**

```typescript
getRowId: (row) => row.modelId,
```

**Why This Causes the Bug:**

1. **Non-Unique Identifiers:**
   - Multiple models can have the same `modelId` across different providers
   - Example: `modelId = "kimi-k2-thinking-turbo"` exists for both:
     - `providerId = "moonshotai-cn"` (Moonshot AI China)
     - `providerId = "moonshotai"` (Moonshot AI)

2. **React Key Conflicts:**
   - When React re-renders the table with new search results, it uses `modelId` as the key
   - If a row with the same `modelId` already exists, React cannot distinguish between them
   - React assumes the existing row is the same as the new row and doesn't remove it
   - This causes old rows to persist in the DOM even when new data arrives

3. **Evidence from Console Errors:**
   ```
   [ERROR] Encountered two children with the same key, `%s`.
   Keys should be unique so that components maintain their identity across updates.
   Non-unique keys may cause children to be duplicated and/or omitted.
   kimi-k2-thinking-turbo @ http://localhost:3000/...
   kimi-k2-turbo-preview @ http://localhost:3000/...
   kimi-k2-0711-preview @ http://localhost:3000/...
   kimi-k2-thinking @ http://localhost:3000/...
   kimi-k2-0905-preview @ http://localhost:3000/...
   ```

### Data Flow Analysis

1. **Initial Load:** User navigates to homepage → Table shows 50 results (Moonshot AI models)
2. **User Searches "Mercury Coder":**
   - SearchBar debounces (300ms) → Updates `globalFilter` state
   - `globalFilter` triggers `useQuery` with new params
   - API call: `getModels({ page: 1, limit: 50, search: "Mercury Coder" })`
   - Backend returns: `{ data: [Inception Mercury Coder], pagination: { total: 1 } }`
   - Table state updates: `table.getRowModel().rows` now has 1 row ✅
   - **React Re-render:** Tries to update DOM using `modelId` as keys ❌
   - React sees duplicate keys and cannot determine which rows to remove
   - Result: Old rows (Moonshot AI models) remain + New row (Mercury Coder) added = 6 rows total

3. **Component State vs. DOM State Mismatch:**
   - React Table State: 1 row (correct)
   - Pagination Component: Shows "1 of 1 results" (correct)
   - Actual DOM: 6 rows (incorrect)

---

## Screenshots/Console Logs

### Network Requests

```bash
[GET] http://localhost:3000/_serverFn/...?payload={...search:""...}
Response: 200 OK
Payload includes: search="Mercury Coder" ✅
```

### Browser Console Errors

- **24 ERROR messages** about duplicate React keys
- All related to Kimi K2 model IDs
- Indicates React cannot uniquely identify rows

### Screenshot

- File: `.playwright/search-mercury-coder-results.png`
- Visual evidence showing 6 rows when only 1 is expected

---

## Bug Severity Assessment

**Severity:** 🔴 **CRITICAL**

**Justification:**

1. **User Impact:** High - Search returns completely incorrect results
2. **Data Integrity:** High - Users see false information
3. **Trust Impact:** High - Users cannot trust the application
4. **Frequency:** Every search operation exposes this bug
5. **Reproducibility:** 100% - Easily reproducible

**Affected Functionality:**

- Search functionality (Phase 6)
- All subsequent searches are affected by stale data
- Pagination display becomes misleading

---

## Recommendations

### Immediate Fix (Required)

**File:** `src/routes/index.tsx`
**Line:** 454

**Change from:**

```typescript
getRowId: (row) => row.modelId,
```

**Change to:**

```typescript
getRowId: (row) => `${row.providerId}-${row.modelId}`,
```

**Why This Fixes It:**

- Creates a composite unique key combining `providerId` and `modelId`
- Each model instance is now uniquely identifiable
- React can correctly track row identity across updates
- Old rows will be properly removed from DOM when new data arrives

### Additional Improvements (Recommended)

1. **Add Unique ID at Data Level:**
   - Consider adding a `uuid` or composite key field at the `FlattenedModel` type level
   - Move this concern from UI layer to data layer

2. **Add TypeScript Validation:**
   - Create a runtime check to ensure `getRowId` produces unique values
   - Add development-mode assertion to catch this earlier

3. **Enhance Error Boundaries:**
   - Add error boundary around ModelList component
   - Show user-friendly error when React key conflicts occur

4. **Add Integration Test:**
   - Create Playwright test to verify search results update correctly
   - Test scenario: Search A → Search B → Verify only B's results shown

### Testing After Fix

**Test Cases to Verify:**

1. **Basic Search:**
   - Search "Mercury Coder" → Verify 1 result shown ✅
   - Clear search → Verify 50 results shown ✅

2. **Multiple Searches:**
   - Search "GPT" → Note results
   - Search "Claude" → Verify ONLY Claude models shown
   - Verify old GPT models are not in DOM ✅

3. **Same Model Different Providers:**
   - Search "kimi-k2"
   - Verify both Moonshot AI (China) and Moonshot AI versions appear
   - Verify no duplicate keys in console ✅

4. **Console Verification:**
   - Search various terms
   - Verify no "duplicate key" errors in browser console ✅

---

## Timeline

| Step                  | Status      |
| --------------------- | ----------- |
| Test Execution        | ✅ Complete |
| Root Cause Identified | ✅ Complete |
| Fix Proposed          | ✅ Complete |
| Fix Applied           | ✅ Complete |
| Verification Testing  | ✅ Complete |

---

## Post-Fix Verification

**Test Date:** 2025-12-29
**Fix Commit:** fix(table): resolve React key duplication causing stale rows on search

### Test Results

✅ **Primary Test Case: Mercury Coder Search**

- Table displays exactly 1 row for "Mercury Coder" search ✅
- URL syncs correctly to `?search=Mercury+Coder` ✅
- Pagination shows "Showing 1 of 1 results" ✅
- No stale rows from previous searches ✅
- No "duplicate key" console errors ✅

✅ **Regression Test: Clear Search**

- Search cleared successfully ✅
- Table returns to showing 50 models ✅
- URL returns to `?page=1&limit=50` ✅
- Pagination shows "Showing 1 to 50 of 1,923 results" ✅
- No console errors ✅

✅ **Regression Test: GPT Search (Multi-Provider Models)**

- Search for "GPT" returns 283 results ✅
- Table displays 50 results on Page 1 ✅
- Multiple providers with same `modelId` displayed correctly (e.g., `openai/gpt-oss-120b` from NanoGPT, Nvidia, SiliconFlow) ✅
- URL syncs correctly to `?search=GPT` ✅
- Pagination shows "Showing 1 to 50 of 283 results" ✅
- No stale rows from previous searches ✅
- No "duplicate key" console errors ✅

### Console Verification

- **Errors:** 0 ✅
- **Warnings:** 0 ✅
- **Duplicate Key Errors:** 0 ✅

### Screenshot Evidence

- Primary screenshot updated (optional): `.playwright/search-mercury-coder-results.png`

### Conclusion

**Status:** PASS ✅
**Fix Verified:** The bug is completely resolved and search functionality works as expected.

The fix changing `getRowId` from `row.modelId` to `${row.providerId}-${row.modelId}` has successfully:

1. Eliminated all React key duplication errors
2. Resolved stale row persistence during searches
3. Correctly handled models with the same `modelId` from different providers
4. Maintained all existing functionality (URL sync, pagination, etc.)
5. No regressions detected across multiple test scenarios

---

## Conclusion

The search functionality had a **critical React key duplication bug** that caused stale table rows to persist across searches. The backend API, URL state sync, and pagination logic were all working correctly. The issue was purely in the table row identity management using non-unique `modelId` values.

**Recommended Action:** The fix has been successfully applied and verified. The feature is ready for production deployment.

---

## Appendices

### A. Technical Details

**React Table Configuration:**

```typescript
const table = useReactTable({
  data: modelsQuery.data.data,
  columns: modelColumns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  manualPagination: true,
  rowCount: modelsQuery.data.pagination.total,
  manualFiltering: true,
  // ...
  getRowId: (row) => `${row.providerId}-${row.modelId}`, // ✅ FIXED
})
```

**Data Structure:**

```typescript
interface FlattenedModel {
  providerId: string // "moonshotai-cn", "moonshotai", "inception"
  modelId: string // "kimi-k2", "mercury-coder"
  modelName: string // "Kimi K2 Thinking Turbo", "Mercury Coder"
  // ... other fields
}
```

### B. Environment Information

- React: 19.x
- TanStack Table: Latest
- TanStack Query: v5
- Browser: Chromium (Playwright)
- Server: Node.js + TanStack Start (Development Mode)

---

**Report Generated By:** QA Specialist (Automated Testing)
**Report Version:** 2.0 (Updated with Post-Fix Verification)
**Last Updated:** 2025-12-29
