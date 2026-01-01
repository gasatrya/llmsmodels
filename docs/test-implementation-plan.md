# AI Models Explorer - Test Implementation Plan

**Document Version:** 1.0  
**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Status:** Active

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Implemented Features Audit](#implemented-features-audit)
3. [Test Coverage Matrix](#test-coverage-matrix)
4. [Detailed Test Plan by Feature](#detailed-test-plan-by-feature)
5. [Testing Strategy](#testing-strategy)
6. [Test Templates and Examples](#test-templates-and-examples)
7. [Implementation Timeline](#implementation-timeline)
8. [Tracking and Metrics](#tracking-and-metrics)

---

## Executive Summary

### Purpose of Test Plan

This document provides a comprehensive roadmap for implementing test coverage across all implemented features in the AI Models Explorer project. It serves as the single source of truth for:

- **Current test status** across all phases
- **Prioritized test implementation schedule**
- **Standardized testing patterns and templates**
- **Quality metrics and success criteria**

The goal is to achieve 80%+ test coverage across all critical paths while maintaining the project's testing best practices as outlined in `docs/testing-guide.md`.

### Current Test Coverage Status

| Metric     | Current | Target | Gap  |
| ---------- | ------- | ------ | ---- |
| Lines      | ~15%    | 80%    | -65% |
| Functions  | ~20%    | 80%    | -60% |
| Branches   | ~10%    | 80%    | -70% |
| Statements | ~15%    | 80%    | -65% |

**Current State:**

- **Phase 8 (Simplified Filters):** FULLY TESTED ✅
  - Unit tests: `tests/unit/filters.test.ts` (235 lines, comprehensive coverage)
  - Component tests: `tests/components/SimplifiedFilters.test.tsx` (437 lines)
  - Fixtures: `tests/fixtures/filter-fixtures.ts` (208 lines)

- **All Other Phases:** NO TESTS ❌

### Goals for Test Coverage

| Priority       | Goal | Timeline |
| -------------- | ---- | -------- |
| Critical paths | 100% | Week 1-2 |
| Components     | 90%  | Week 2-3 |
| API/Utilities  | 80%  | Week 3-4 |
| Integration    | 80%  | Week 4-5 |
| Overall        | 80%  | Week 5   |

---

## Implemented Features Audit

### Phase Overview

| Phase | Feature             | Status      | Tests      | Priority |
| ----- | ------------------- | ----------- | ---------- | -------- |
| 1     | Project Setup       | ✅ Complete | ❌         | N/A      |
| 2     | TypeScript Types    | ✅ Complete | ⚠️ Partial | HIGH     |
| 3     | API Integration     | ✅ Complete | ❌         | HIGH     |
| 3.5   | Custom Server API   | ✅ Complete | ❌         | HIGH     |
| 4     | Basic Table Layout  | ✅ Complete | ❌         | MEDIUM   |
| 5     | Pagination Controls | ✅ Complete | ❌         | HIGH     |
| 6     | Search Integration  | ✅ Complete | ❌         | HIGH     |
| 7     | Column Visibility   | ✅ Complete | ❌         | HIGH     |
| 8     | Simplified Filters  | ✅ Complete | ✅         | DONE     |

### Detailed Feature Breakdown

#### Phase 1: Project Setup ✅

**What was implemented:**

- Dependency installation and configuration
- Vite, TypeScript, TanStack ecosystem setup
- Project structure and aliases

**Test Status:** N/A (configuration files)
**Testing Approach:** Manual verification, CI checks

#### Phase 2: TypeScript Types ✅

**What was implemented:**

- `src/types/models.ts` - Core type definitions
- `src/types/column-visibility.ts` - Column visibility types
- `src/types/index.ts` - Type exports
- Type guards: `isFlattenedModel()`, `isValidModality()`

**Test Status:** ⚠️ PARTIAL
**Tests Needed:**

- Type guard tests (existing but minimal)
- Type definition validation tests
- Complex type tests

**Files to test:**

- `src/types/models.ts` (173 lines)
- `src/types/column-visibility.ts`

#### Phase 3: API Integration ✅

**What was implemented:**

- `src/lib/models-api.ts` - Server function + query options
- `src/lib/models-transform.ts` - Data transformation (62 lines)
- Data flattening logic

**Test Status:** ❌ NO TESTS
**Priority:** HIGH (critical data path)

**Files to test:**

- `src/lib/models-transform.ts` (data transformation)
- `src/lib/models-api.ts` (server function)

#### Phase 3.5: Custom Server API ✅

**What was implemented:**

- `src/lib/api/models.ts` (227 lines)
- In-memory caching (24-hour TTL)
- Server-side pagination
- Server-side search with Fuse.js
- Zod schema validation

**Test Status:** ❌ NO TESTS
**Priority:** HIGH (critical path)

**Files to test:**

- `src/lib/api/models.ts` (full file)
- Cache invalidation logic
- Pagination logic
- Search/filter logic

#### Phase 4: Basic Table Layout ✅

**What was implemented:**

- `src/components/ModelList/ModelList.tsx` (68 lines)
- 27 column definitions
- Sorting functionality
- Row selection
- TanStack Table integration

**Test Status:** ❌ NO TESTS
**Priority:** MEDIUM

**Files to test:**

- `src/components/ModelList/ModelList.tsx`
- Column definitions (inline in index.tsx)

#### Phase 5: Pagination Controls ✅

**What was implemented:**

- `src/components/PaginationControls/PaginationControls.tsx` (170 lines)
- Previous/Next navigation
- Page number display
- "Showing X of Y results"
- Page size selector
- URL synchronization

**Test Status:** ❌ NO TESTS
**Priority:** HIGH (frequently used)

**Files to test:**

- `src/components/PaginationControls/PaginationControls.tsx`

#### Phase 6: Search Integration ✅

**What was implemented:**

- `src/components/SearchBar/SearchBar.tsx` (64 lines)
- `src/hooks/useDebounce.ts` (18 lines)
- 300ms debouncing
- Clear button
- URL sync

**Test Status:** ❌ NO TESTS
**Priority:** HIGH (core feature)

**Files to test:**

- `src/components/SearchBar/SearchBar.tsx`
- `src/hooks/useDebounce.ts`

#### Phase 7: Column Visibility ✅

**What was implemented:**

- `src/components/ColumnVisibilityToggle/ColumnVisibilityToggle.tsx` (137 lines)
- 27 column toggles
- "Show All" and "Reset" buttons
- Dropdown UI
- In-memory state

**Test Status:** ❌ NO TESTS
**Priority:** HIGH (core feature)

**Files to test:**

- `src/components/ColumnVisibilityToggle/ColumnVisibilityToggle.tsx`
- `src/types/column-visibility.ts`

#### Phase 8: Simplified Filters ✅

**What was implemented:**

- `src/components/SimplifiedFilters/` (component + tests exist)
- 3 capability filters (reasoning, toolCall, openWeights)
- Toggle behavior
- URL sync

**Test Status:** ✅ FULLY TESTED
**Tests:**

- `tests/unit/filters.test.ts` - Unit tests for utility functions
- `tests/components/SimplifiedFilters.test.tsx` - Component tests
- `tests/fixtures/filter-fixtures.ts` - Reusable fixtures

**Test Coverage:** ~95%

---

## Test Coverage Matrix

| Feature                 | Implemented | Tests      | Priority | Est. Tests | Effort |
| ----------------------- | ----------- | ---------- | -------- | ---------- | ------ |
| Phase 2: Type Guards    | ✅          | ⚠️ Partial | HIGH     | 10         | 2 hrs  |
| Phase 3: Data Transform | ✅          | ❌         | HIGH     | 15         | 4 hrs  |
| Phase 3.5: Server API   | ✅          | ❌         | HIGH     | 30         | 8 hrs  |
| Phase 4: ModelList      | ✅          | ❌         | MEDIUM   | 20         | 5 hrs  |
| Phase 5: Pagination     | ✅          | ❌         | HIGH     | 25         | 6 hrs  |
| Phase 6: SearchBar      | ✅          | ❌         | HIGH     | 20         | 5 hrs  |
| Phase 6: useDebounce    | ✅          | ❌         | HIGH     | 10         | 2 hrs  |
| Phase 7: Column Toggle  | ✅          | ❌         | HIGH     | 25         | 6 hrs  |
| Phase 8: Filters        | ✅          | ✅         | DONE     | 50         | Done   |

**Total Estimated Tests:** ~195  
**Total Estimated Effort:** ~43 hours

---

## Detailed Test Plan by Feature

### Phase 2: TypeScript Type Guards

#### What to Test

1. **`isFlattenedModel()` function**
   - Valid FlattenedModel objects
   - Invalid inputs (null, undefined, primitives)
   - Partial objects
   - Objects with wrong properties

2. **`isValidModality()` function**
   - Valid modalities (text, image, audio, video, pdf)
   - Invalid modality strings
   - Case sensitivity

#### Test Scenarios

```typescript
describe('isFlattenedModel', () => {
  it('returns true for valid FlattenedModel', () => {
    const validModel = createValidFlattenedModel()
    expect(isFlattenedModel(validModel)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isFlattenedModel(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isFlattenedModel(undefined)).toBe(false)
  })

  it('returns false for primitive types', () => {
    expect(isFlattenedModel('string')).toBe(false)
    expect(isFlattenedModel(123)).toBe(false)
    expect(isFlattenedModel(true)).toBe(false)
  })

  it('returns false for object missing required properties', () => {
    expect(isFlattenedModel({ modelName: 'test' })).toBe(false)
    expect(isFlattenedModel({ providerName: 'test' })).toBe(false)
  })

  it('returns false for object with extra properties', () => {
    expect(
      isFlattenedModel({
        modelName: 'test',
        providerName: 'test',
        extra: 'value',
      }),
    ).toBe(true)
  })
})

describe('isValidModality', () => {
  it('returns true for valid modalities', () => {
    expect(isValidModality('text')).toBe(true)
    expect(isValidModality('image')).toBe(true)
    expect(isValidModality('audio')).toBe(true)
    expect(isValidModality('video')).toBe(true)
    expect(isValidModality('pdf')).toBe(true)
  })

  it('returns false for invalid modalities', () => {
    expect(isValidModality('text2')).toBe(false)
    expect(isValidModality('IMAGE')).toBe(false)
    expect(isValidModality('')).toBe(false)
  })
})
```

#### Estimated Tests: 10 tests

#### Effort: 2 hours

#### Priority: HIGH

---

### Phase 3: Data Transformation

#### What to Test

1. **`flattenModelsData()` function**
   - Empty input
   - Single provider, single model
   - Multiple providers, multiple models
   - Missing optional fields
   - Default value handling

#### Test Scenarios

```typescript
describe('flattenModelsData', () => {
  it('handles empty response', () => {
    const emptyResponse = {}
    const result = flattenModelsData(emptyResponse)
    expect(result).toEqual([])
  })

  it('transforms single provider with single model', () => {
    const singleModelResponse = createSingleModelResponse()
    const result = flattenModelsData(singleModelResponse)

    expect(result).toHaveLength(1)
    expect(result[0].modelName).toBe('gpt-4')
    expect(result[0].providerName).toBe('OpenAI')
  })

  it('transforms multiple providers and models', () => {
    const multiModelResponse = createMultiModelResponse()
    const result = flattenModelsData(multiModelResponse)

    expect(result).toHaveLength(4)
    expect(result[0].providerId).toBe('openai')
    expect(result[1].providerId).toBe('anthropic')
  })

  it('handles missing optional fields with defaults', () => {
    const response = createResponseWithMissingFields()
    const result = flattenModelsData(response)

    expect(result[0].inputCost).toBeUndefined()
    expect(result[0].inputModalities).toEqual([])
    expect(result[0].contextLimit).toBe(0)
  })

  it('maps nested API fields correctly', () => {
    const response = createStandardResponse()
    const result = flattenModelsData(response)

    expect(result[0].toolCall).toBe(true)
    expect(result[0].reasoning).toBe(false)
    expect(result[0].weights).toBe('Open')
    expect(result[0].inputCost).toBe(5.0)
    expect(result[0].outputCost).toBe(15.0)
  })
})
```

#### Estimated Tests: 15 tests

#### Effort: 4 hours

#### Priority: HIGH

---

### Phase 3.5: Server API

#### What to Test

1. **Input Validation (Zod schema)**
   - Valid inputs
   - Invalid page numbers
   - Invalid limits
   - Missing required fields

2. **Pagination Logic**
   - First page
   - Last page
   - Middle pages
   - Edge cases (page 0, page beyond total)

3. **Search/Filter Logic**
   - Empty search returns all
   - Fuzzy search finds matches
   - Case insensitive search
   - Special characters

4. **Cache Logic**
   - Cache miss fetches fresh data
   - Cache hit returns cached data
   - Cache expiration after 24 hours

#### Test Scenarios

```typescript
describe('GetModelsSchema', () => {
  it('accepts valid input', () => {
    const validInput = { page: 1, limit: 50, search: 'gpt' }
    const result = GetModelsSchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  it('defaults page to 1', () => {
    const result = GetModelsSchema.safeParse({})
    expect(result.success).toBe(true)
    expect(result.data.page).toBe(1)
  })

  it('rejects negative page', () => {
    const result = GetModelsSchema.safeParse({ page: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects limit > 100', () => {
    const result = GetModelsSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })
})

describe('applyPagination', () => {
  it('returns first page correctly', () => {
    const models = createMockModels(100)
    const result = applyPagination(models, 1, 10)

    expect(result.paginated).toHaveLength(10)
    expect(result.meta.page).toBe(1)
    expect(result.meta.total).toBe(100)
    expect(result.meta.totalPages).toBe(10)
  })

  it('returns last page correctly', () => {
    const models = createMockModels(100)
    const result = applyPagination(models, 10, 10)

    expect(result.paginated).toHaveLength(10)
    expect(result.meta.page).toBe(10)
    expect(result.meta.hasMore).toBe(false)
  })

  it('handles partial last page', () => {
    const models = createMockModels(95)
    const result = applyPagination(models, 10, 10)

    expect(result.paginated).toHaveLength(5)
    expect(result.meta.totalPages).toBe(10)
  })

  it('handles empty result set', () => {
    const models: FlattenedModel[] = []
    const result = applyPagination(models, 1, 10)

    expect(result.paginated).toHaveLength(0)
    expect(result.meta.total).toBe(0)
    expect(result.meta.totalPages).toBe(0)
  })
})

describe('applySearchFilter', () => {
  it('returns all models for empty search', () => {
    const models = createMockModels(50)
    const result = applySearchFilter(models, '')

    expect(result).toHaveLength(50)
  })

  it('finds models by model name', () => {
    const models = createMockModelsWithNames(['gpt-4', 'claude-3', 'gpt-3.5'])
    const result = applySearchFilter(models, 'gpt')

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((m) => m.modelName.includes('gpt'))).toBe(true)
  })

  it('finds models by provider name', () => {
    const models = createMockModelsWithProviders([
      'OpenAI',
      'Anthropic',
      'OpenAI',
    ])
    const result = applySearchFilter(models, 'OpenAI')

    expect(result.every((m) => m.providerName === 'OpenAI')).toBe(true)
  })
})
```

#### Estimated Tests: 30 tests

#### Effort: 8 hours

#### Priority: HIGH

---

### Phase 4: ModelList Component

#### What to Test

1. **Rendering**
   - Table renders with data
   - All 27 columns render
   - Headers render correctly

2. **Sorting**
   - Click header sorts ascending
   - Click header again sorts descending
   - Sort indicator displays

3. **Row rendering**
   - Rows render with correct data
   - Selected rows have different style
   - Hover state works

4. **Empty state**
   - Empty table renders correctly
   - Loading state

#### Test Scenarios

```typescript
describe('ModelList', () => {
  const mockTable = createMockTableWithData(mockModels)

  it('renders table with data', () => {
    render(<ModelList table={mockTable} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('renders all column headers', () => {
    render(<ModelList table={mockTable} />)

    // Verify key columns are present
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('Provider')).toBeInTheDocument()
  })

  it('renders all rows', () => {
    render(<ModelList table={mockTable} />)

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(mockModels.length + 1) // +1 for header
  })

  it('displays sort indicators when sorted', () => {
    mockTable.getState().sorting = [{ id: 'modelName', desc: true }]
    render(<ModelList table={mockTable} />)

    expect(screen.getByText('↓')).toBeInTheDocument()
  })

  it('highlights selected rows', () => {
    mockTable.getRowModel().rows[0].getIsSelected = () => true
    render(<ModelList table={mockTable} />)

    const firstRow = screen.getAllByRole('row')[1]
    expect(firstRow).toHaveClass('bg-blue-50')
  })
})
```

#### Estimated Tests: 20 tests

#### Effort: 5 hours

#### Priority: MEDIUM

---

### Phase 5: PaginationControls Component

#### What to Test

1. **Rendering**
   - Row count displays correctly
   - Page info displays
   - All buttons render

2. **Navigation**
   - Previous button click
   - Next button click
   - First page button
   - Last page button

3. **Page Size**
   - Changing page size
   - Options display correctly

4. **Disabled States**
   - Previous disabled on first page
   - Next disabled on last page
   - All disabled while fetching

5. **Accessibility**
   - ARIA labels present
   - Keyboard navigation

#### Test Scenarios

```typescript
describe('PaginationControls', () => {
  const createMockTable = (pageIndex: number, pageCount: number, canPrevious = true, canNext = true) =>
    createMockTableWithPagination(pageIndex, pageCount, canPrevious, canNext)

  it('displays correct row range', () => {
    const mockTable = createMockTableWithRowData(5, 10, 100)
    render(<PaginationControls table={mockTable} totalRows={100} />)

    expect(screen.getByText('Showing 1 to 10 of 100 results')).toBeInTheDocument()
  })

  it('displays "No results" when row count is 0', () => {
    const mockTable = createMockTableWithRowData(0, 10, 0)
    render(<PaginationControls table={mockTable} totalRows={0} />)

    expect(screen.getByText('No results')).toBeInTheDocument()
  })

  it('displays current page info', () => {
    const mockTable = createMockTable(2, 5) // Page 3 of 5
    render(<PaginationControls table={mockTable} />)

    expect(screen.getByText('Page 3 of 5')).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    const mockTable = createMockTable(0, 5, false, true)
    render(<PaginationControls table={mockTable} />)

    const prevButton = screen.getByLabelText('Go to previous page')
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    const mockTable = createMockTable(4, 5, true, false)
    render(<PaginationControls table={mockTable} />)

    const nextButton = screen.getByLabelText('Go to next page')
    expect(nextButton).toBeDisabled()
  })

  it('shows loading indicator when isFetching is true', () => {
    const mockTable = createMockTable(0, 5, false, true)
    render(<PaginationControls table={mockTable} isFetching={true} />)

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument()
  })

  it('changes page size when selection changes', () => {
    const mockTable = createMockTableWithPageSize()
    const onPageSizeChange = vi.fn()
    mockTable.setPageSize = onPageSizeChange

    render(<PaginationControls table={mockTable} />)

    fireEvent.change(screen.getByLabelText('Rows per page'), {
      target: { value: '20' },
    })

    expect(onPageSizeChange).toHaveBeenCalledWith(20)
  })
})
```

#### Estimated Tests: 25 tests

#### Effort: 6 hours

#### Priority: HIGH

---

### Phase 6: SearchBar Component

#### What to Test

1. **Rendering**
   - Input renders with placeholder
   - Search icon displays
   - Clear button shows when input has value

2. **Input Behavior**
   - Typing updates local state
   - Debounced value sent to onChange
   - Placeholder text

3. **Clear Functionality**
   - Clicking clear button clears input
   - onChange called with empty string

4. **Accessibility**
   - ARIA labels present
   - Search input labeled correctly

#### Test Scenarios

```typescript
describe('SearchBar', () => {
  it('renders with default placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(
      screen.getByPlaceholderText('Search models and providers...')
    ).toBeInTheDocument()
  })

  it('renders with custom placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} placeholder="Custom placeholder" />)

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })

  it('updates local input value on typing', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    const input = screen.getByLabelText('Search models and providers')
    fireEvent.change(input, { target: { value: 'gpt' } })

    expect(input).toHaveValue('gpt')
  })

  it('calls onChange with debounced value', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search models and providers')
    fireEvent.change(input, { target: { value: 'gpt' } })

    // Wait for debounce (300ms + buffer)
    vi.advanceTimersByTime(350)

    expect(onChange).toHaveBeenCalledWith('gpt')
  })

  it('does not call onChange while typing (before debounce)', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)

    const input = screen.getByLabelText('Search models and providers')
    fireEvent.change(input, { target: { value: 'g' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('shows clear button when input has value', () => {
    render(<SearchBar value="test" onChange={vi.fn()} />)

    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('hides clear button when input is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} />)

    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('clears input when clear button clicked', () => {
    const onChange = vi.fn()
    render(<SearchBar value="test" onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('Clear search'))

    expect(onChange).toHaveBeenCalledWith('')
  })
})
```

#### Estimated Tests: 20 tests

#### Effort: 5 hours

#### Priority: HIGH

---

### Phase 6: useDebounce Hook

#### What to Test

1. **Basic Behavior**
   - Returns initial value immediately
   - Updates after delay

2. **Value Changes**
   - Rapid changes debounce correctly
   - Only final value returned

3. **Delay Configuration**
   - Custom delay works

4. **Cleanup**
   - Timeout cleared on unmount
   - Timeout cleared on value change

#### Test Scenarios

```typescript
describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))

    expect(result.current).toBe('initial')
  })

  it('returns updated value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } },
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    vi.advanceTimersByTime(350)
    expect(result.current).toBe('updated')
  })

  it('debounces rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'v1' } },
    )

    expect(result.current).toBe('v1')

    rerender({ value: 'v2' })
    rerender({ value: 'v3' })
    rerender({ value: 'v4' })

    vi.advanceTimersByTime(350)
    expect(result.current).toBe('v4')
  })

  it('uses default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    })

    rerender({ value: 'updated' })

    vi.advanceTimersByTime(200)
    expect(result.current).toBe('initial')

    vi.advanceTimersByTime(200)
    expect(result.current).toBe('updated')
  })

  it('clears timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce('value', 300))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
```

#### Estimated Tests: 10 tests

#### Effort: 2 hours

#### Priority: HIGH

---

### Phase 7: ColumnVisibilityToggle Component

#### What to Test

1. **Dropdown**
   - Opens on button click
   - Closes on overlay click
   - Closes on closeDropdown

2. **Show All**
   - Makes all columns visible
   - Calls onVisibilityChange with all true

3. **Reset**
   - Resets to default columns
   - Calls onVisibilityChange with defaults

4. **Individual Toggles**
   - Toggles column visibility
   - Calls onVisibilityChange with updated state

5. **Accessibility**
   - ARIA attributes
   - Keyboard navigation

#### Test Scenarios

```typescript
describe('ColumnVisibilityToggle', () => {
  const createMockTable = () => ({
    getColumn: vi.fn((id) => ({
      toggleVisibility: vi.fn(),
      getIsVisible: () => true,
    })),
    getState: () => ({ columnVisibility: {} }),
  })

  it('renders column toggle button', () => {
    const mockTable = createMockTable()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Toggle column visibility')).toBeInTheDocument()
  })

  it('opens dropdown when button clicked', () => {
    const mockTable = createMockTable()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Visible Columns')).toBeInTheDocument()
  })

  it('closes dropdown when overlay clicked', () => {
    const mockTable = createMockTable()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))
    fireEvent.click(screen.getByTestId('overlay'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows all columns when Show All clicked', () => {
    const mockTable = createMockTable()
    const onVisibilityChange = vi.fn()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={onVisibilityChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))
    fireEvent.click(screen.getByText('Show all'))

    expect(onVisibilityChange).toHaveBeenCalled()
    const newVisibility = onVisibilityChange.mock.calls[0][0]
    expect(Object.values(newVisibility).every(Boolean)).toBe(true)
  })

  it('resets to default columns when Reset clicked', () => {
    const mockTable = createMockTable()
    const onVisibilityChange = vi.fn()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={onVisibilityChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))
    fireEvent.click(screen.getByText('Reset'))

    expect(onVisibilityChange).toHaveBeenCalled()
  })

  it('toggles individual column visibility', () => {
    const mockColumn = {
      toggleVisibility: vi.fn(),
      getIsVisible: () => true,
    }
    const mockTable = {
      ...createMockTable(),
      getColumn: (id: string) => mockColumn,
    }
    const onVisibilityChange = vi.fn()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={onVisibilityChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))

    const checkbox = screen.getByLabelText('Toggle Model column visibility')
    fireEvent.click(checkbox)

    expect(mockColumn.toggleVisibility).toHaveBeenCalledWith(true)
    expect(onVisibilityChange).toHaveBeenCalled()
  })

  it('displays all 27 columns in dropdown', () => {
    const mockTable = createMockTable()
    render(
      <ColumnVisibilityToggle
        table={mockTable}
        onVisibilityChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByLabelText('Toggle column visibility'))

    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(27)
  })
})
```

#### Estimated Tests: 25 tests

#### Effort: 6 hours

#### Priority: HIGH

---

## Testing Strategy

### Implementation Approach

| Phase      | Approach          | Rationale                               |
| ---------- | ----------------- | --------------------------------------- |
| Data/Utils | Test-after        | Pure functions, straightforward to test |
| Hooks      | TDD               | Behavior is well-defined                |
| Components | TDD + Integration | UI behavior critical, need coverage     |
| API        | Test-after        | Server functions, mocking complex       |

### Test Pyramid Alignment

```
Unit Tests (70%)          ████████████████████
Integration Tests (20%)   ████████
E2E Tests (10%)           ███
```

**Distribution:**

- Unit tests: ~140 tests (data, utilities, hooks)
- Integration tests: ~40 tests (component interactions)
- E2E tests: ~15 tests (critical user flows)

### Incremental Implementation

1. **Week 1:** Critical paths (API, pagination, search)
2. **Week 2:** Components (ModelList, ColumnToggle)
3. **Week 3:** Utilities and hooks
4. **Week 4:** Integration tests
5. **Week 5:** Coverage cleanup

### When to Write Tests

| Scenario               | Test Timing                      |
| ---------------------- | -------------------------------- |
| New feature            | Before implementation (TDD)      |
| Bug fix                | After fix, to prevent regression |
| Refactoring            | Before, to verify behavior       |
| Non-critical utilities | After implementation             |

### Coverage Goals

| Component Type | Line Coverage | Branch Coverage |
| -------------- | ------------- | --------------- |
| Data utilities | 95%           | 90%             |
| Hooks          | 90%           | 85%             |
| Components     | 85%           | 80%             |
| API functions  | 90%           | 85%             |

---

## Test Templates and Examples

### Unit Test Template

```typescript
/**
 * [Module Name] Unit Tests
 *
 * Brief description of what's being tested.
 */

import { describe, it, expect } from 'vitest'
import { functionToTest } from '@/path/to/module'
import { createTestFixture } from '../fixtures/test-fixtures'

describe('[Module/Function Name]', () => {
  describe('[Behavior Category 1]', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange
      const input = createTestFixture('valid-input')

      // Act
      const result = functionToTest(input)

      // Assert
      expect(result).toEqual(expectedOutput)
    })

    it('should [expected behavior] when [edge case]', () => {
      // Arrange
      const input = createTestFixture('edge-case')

      // Act
      const result = functionToTest(input)

      // Assert
      expect(result).toBe(expectedValue)
    })
  })

  describe('[Behavior Category 2]', () => {
    it('should throw [error type] when [invalid input]', () => {
      // Arrange
      const input = createTestFixture('invalid-input')

      // Act & Assert
      expect(() => functionToTest(input)).toThrow(ErrorType)
    })
  })
})
```

### Component Test Template

```typescript
/**
 * [Component Name] Component Tests
 *
 * Brief description of what's being tested.
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { ComponentName } from '@/components/ComponentName'
import { renderWithProviders } from '../utils/test-helpers'
import { COMPONENT_FIXTURES } from '../fixtures/component-fixtures'

describe('[Component Name]', () => {
  describe('rendering', () => {
    it('should render correctly with default props', () => {
      renderWithProviders(<ComponentName />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      renderWithProviders(<ComponentName className="custom-class" />)

      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })
  })

  describe('interactions', () => {
    it('should call onAction when clicked', () => {
      const onAction = vi.fn()
      renderWithProviders(<ComponentName onAction={onAction} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithProviders(<ComponentName />)

      expect(screen.getByRole('button')).toHaveAttribute('aria-label')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined onAction gracefully', () => {
      renderWithProviders(<ComponentName onAction={undefined} />)

      expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
    })
  })
})
```

### Fixture Pattern

```typescript
// tests/fixtures/api-fixtures.ts

import type { FlattenedModel, ModelsApiResponse } from '@/types/models'

/**
 * Creates a mock API response with the specified number of models
 */
export function createMockApiResponse(modelCount: number): ModelsApiResponse {
  const providers: ModelsApiResponse = {
    openai: {
      id: 'openai',
      name: 'OpenAI',
      npm: '@openai',
      env: ['OPENAI_API_KEY'],
      doc: 'https://platform.openai.com/docs',
      models: {},
    },
  }

  for (let i = 0; i < modelCount; i++) {
    providers.openai.models[`model-${i}`] = {
      id: `model-${i}`,
      name: `GPT-${i + 1}`,
      family: 'GPT',
      tool_call: i % 2 === 0,
      reasoning: i % 3 === 0,
      release_date: '2024-01-01',
      last_updated: '2024-12-01',
      open_weights: false,
      cost: {
        input: 0.01 * i,
        output: 0.03 * i,
      },
      limit: {
        context: 128000,
        input: 128000,
        output: 8192,
      },
      modalities: {
        input: ['text'],
        output: ['text'],
      },
    }
  }

  return providers
}

/**
 * Creates a mock flattened model
 */
export function createMockFlattenedModel(
  overrides: Partial<FlattenedModel> = {},
): FlattenedModel {
  return {
    selected: false,
    providerName: 'OpenAI',
    providerId: 'openai',
    modelName: 'GPT-4',
    modelFamily: 'GPT',
    modelId: 'gpt-4',
    toolCall: true,
    reasoning: true,
    structuredOutput: true,
    inputModalities: ['text'],
    outputModalities: ['text'],
    inputCost: 5.0,
    outputCost: 15.0,
    reasoningCost: undefined,
    cacheReadCost: undefined,
    cacheWriteCost: undefined,
    audioInputCost: undefined,
    audioOutputCost: undefined,
    contextLimit: 128000,
    inputLimit: undefined,
    outputLimit: 8192,
    weights: 'Closed',
    knowledge: '2024-06',
    releaseDate: '2024-03-14',
    lastUpdated: '2024-12-01',
    ...overrides,
  }
}

/**
 * Creates an array of mock flattened models
 */
export function createMockFlattenedModels(count: number): FlattenedModel[] {
  return Array.from({ length: count }, (_, i) =>
    createMockFlattenedModel({
      modelId: `model-${i}`,
      modelName: `Model ${i + 1}`,
    }),
  )
}
```

### Mock Pattern

```typescript
// tests/mocks/table-mock.ts

import type { Table } from '@tanstack/react-table'
import type { FlattenedModel } from '@/types/models'

/**
 * Creates a mock TanStack Table for testing
 */
export function createMockTable(
  data: FlattenedModel[] = [],
): Table<FlattenedModel> {
  const mockRows = data.map((model, index) => ({
    id: `${index}`,
    original: model,
    getIsSelected: () => false,
    getVisibleCells: () =>
      [] as Array<{
        id: string
        column: {
          id: string
          getSize: () => number
          columnDef: { cell: unknown }
        }
      }>,
  }))

  return {
    getState: () => ({
      pagination: { pageIndex: 0, pageSize: 50 },
      sorting: [],
      columnVisibility: {},
    }),
    getPageCount: () => Math.ceil(data.length / 50),
    getCanPreviousPage: () => false,
    getCanNextPage: () => data.length > 50,
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    getRowModel: () => ({
      rows: mockRows,
    }),
    getHeaderGroups: () => [
      {
        id: 'header-group',
        headers:
          data.length > 0
            ? [
                {
                  id: 'header',
                  column: { id: 'modelName', getCanSort: () => true },
                },
              ]
            : [],
      },
    ],
    getColumn: (id: string) => ({
      toggleVisibility: vi.fn(),
      getIsVisible: () => true,
      columnDef: { header: 'Header' },
    }),
  } as unknown as Table<FlattenedModel>
}
```

---

## Implementation Timeline

### Week 1: Critical Paths (Phases 3.5, 5, 6)

**Goal:** 50% overall coverage

| Day       | Focus                | Deliverables                                              |
| --------- | -------------------- | --------------------------------------------------------- |
| Monday    | Phase 3.5 Server API | `tests/unit/api/models.test.ts` (30 tests)                |
| Tuesday   | Phase 3.5 Server API | Complete API tests, verify coverage                       |
| Wednesday | Phase 6 SearchBar    | `tests/components/SearchBar.test.tsx` (20 tests)          |
| Thursday  | Phase 6 useDebounce  | `tests/unit/hooks/useDebounce.test.ts` (10 tests)         |
| Friday    | Phase 5 Pagination   | `tests/components/PaginationControls.test.tsx` (25 tests) |

**End of Week 1 Coverage Target:** ~50%

### Week 2: Components (Phases 4, 7)

**Goal:** 65% overall coverage

| Day       | Focus                 | Deliverables                                                  |
| --------- | --------------------- | ------------------------------------------------------------- |
| Monday    | Phase 7 Column Toggle | `tests/components/ColumnVisibilityToggle.test.tsx` (25 tests) |
| Tuesday   | Phase 7 Column Toggle | Complete column toggle tests                                  |
| Wednesday | Phase 4 ModelList     | `tests/components/ModelList.test.tsx` (20 tests)              |
| Thursday  | Phase 4 ModelList     | Complete ModelList tests                                      |
| Friday    | Review & Integration  | Fix any failing tests, verify coverage                        |

**End of Week 2 Coverage Target:** ~65%

### Week 3: Utilities (Phases 2, 3)

**Goal:** 75% overall coverage

| Day       | Focus                  | Deliverables                                       |
| --------- | ---------------------- | -------------------------------------------------- |
| Monday    | Phase 3 Data Transform | `tests/unit/models-transform.test.ts` (15 tests)   |
| Tuesday   | Phase 3 Data Transform | Complete transform tests                           |
| Wednesday | Phase 2 Type Guards    | `tests/unit/types/models-guard.test.ts` (10 tests) |
| Thursday  | Type definitions       | Additional type tests                              |
| Friday    | Fixtures & Mocks       | Expand test fixtures, create missing mocks         |

**End of Week 3 Coverage Target:** ~75%

### Week 4: Integration Tests

**Goal:** 80% overall coverage

| Day       | Focus                         | Deliverables                                   |
| --------- | ----------------------------- | ---------------------------------------------- |
| Monday    | Filter State Integration      | `tests/integration/filter-state.test.tsx`      |
| Tuesday   | Search + Table Integration    | `tests/integration/search-table.test.tsx`      |
| Wednesday | Pagination + API Integration  | `tests/integration/pagination-api.test.tsx`    |
| Thursday  | Column Visibility Integration | `tests/integration/column-visibility.test.tsx` |
| Friday    | Full Workflow Integration     | `tests/integration/full-workflow.test.tsx`     |

**End of Week 4 Coverage Target:** ~80%

### Week 5: Coverage Cleanup

**Goal:** 80%+ overall coverage with no gaps

| Day       | Focus             | Deliverables                                     |
| --------- | ----------------- | ------------------------------------------------ |
| Monday    | Coverage Analysis | Generate coverage report, identify gaps          |
| Tuesday   | Gap Filling       | Add missing tests for uncovered code             |
| Wednesday | Edge Cases        | Add edge case tests, error handling tests        |
| Thursday  | Performance       | Optimize slow tests, add test performance checks |
| Friday    | Final Review      | Final coverage verification, documentation       |

**End of Week 5 Coverage Target:** 80%+

---

## Tracking and Metrics

### Progress Tracking

| Metric     | Current | Week 1 | Week 2 | Week 3 | Week 4 | Week 5 |
| ---------- | ------- | ------ | ------ | ------ | ------ | ------ |
| Lines      | 15%     | 50%    | 65%    | 75%    | 80%    | 85%    |
| Functions  | 20%     | 55%    | 70%    | 78%    | 82%    | 85%    |
| Branches   | 10%     | 45%    | 60%    | 70%    | 78%    | 82%    |
| Statements | 15%     | 50%    | 65%    | 75%    | 80%    | 85%    |
| Tests      | 50      | 130    | 175    | 200    | 235    | 250    |

### Weekly Checklist

```markdown
## Week [N] Checklist

- [ ] Run coverage report: `npm run test -- --coverage`
- [ ] Review uncovered lines
- [ ] Add tests for new uncovered code
- [ ] Fix any failing tests
- [ ] Update progress table
- [ ] Document any decisions made
```

### Success Criteria

| Criteria                  | Target | Status |
| ------------------------- | ------ | ------ |
| Overall line coverage     | 80%    | ⏳     |
| Function coverage         | 80%    | ⏳     |
| Branch coverage           | 80%    | ⏳     |
| Critical path coverage    | 100%   | ⏳     |
| All Phase 8 tests passing | 100%   | ✅     |
| No new untested code      | 100%   | ⏳     |
| All tests < 100ms         | 95%    | ⏳     |

### Definition of Done for Test Plan

- [x] Test plan document created
- [x] All implemented features audited
- [x] Test priorities assigned
- [x] Timeline provided
- [x] Templates and examples included
- [x] Tracking mechanism defined
- [ ] Phase 3.5 tests implemented
- [ ] Phase 5 tests implemented
- [ ] Phase 6 tests implemented
- [ ] Phase 7 tests implemented
- [ ] Phase 4 tests implemented
- [ ] Phase 2-3 tests implemented
- [ ] Integration tests implemented
- [ ] 80% coverage achieved

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- tests/unit/filters.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="should return true"

# Run in watch mode
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage
```

### Coverage Report Location

- HTML: `coverage/index.html`
- JSON: `coverage/coverage.json`
- LCOV: `coverage/lcov.info`

Open `coverage/index.html` in a browser to view detailed coverage information.

---

## Appendices

### A. Test File Checklist

When creating new test files, ensure:

- [ ] File follows naming convention: `*.test.ts` or `*.test.tsx`
- [ ] Located in correct directory (`tests/unit/`, `tests/components/`, etc.)
- [ ] Uses AAA pattern (Arrange, Act, Assert)
- [ ] Has descriptive test names
- [ ] Tests cover happy path, edge cases, and error cases
- [ ] Uses appropriate fixtures
- [ ] Mocks are properly reset between tests
- [ ] Accessibility attributes are tested

### B. Common Assertions

| Assertion                       | Usage                     |
| ------------------------------- | ------------------------- |
| `toBe(value)`                   | Primitive equality        |
| `toEqual(object)`               | Deep object equality      |
| `toBeInTheDocument()`           | Element exists            |
| `toBeChecked()`                 | Checkbox is checked       |
| `toHaveValue(value)`            | Input has value           |
| `toHaveAttribute(name, value)`  | Element has attribute     |
| `toHaveClass(className)`        | Element has class         |
| `toHaveBeenCalled()`            | Function was called       |
| `toHaveBeenCalledWith(...args)` | Function called with args |
| `toThrow()`                     | Function throws           |

### C. Testing Library Queries

| Query            | Returns       | Usage                |
| ---------------- | ------------- | -------------------- |
| `getByRole`      | Element       | Find by ARIA role    |
| `getByLabelText` | Element       | Find by label        |
| `getByText`      | Element       | Find by text content |
| `getByTestId`    | Element       | Find by data-testid  |
| `queryBy`        | Element\|null | Non-throwing find    |
| `findBy`         | Promise       | Async find element   |
| `getAllBy*`      | Array         | Find multiple        |

---

**Document Owner:** QA Specialist  
**Review Cycle:** Weekly  
**Next Review:** January 9, 2026
