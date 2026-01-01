# Testing Guide

A comprehensive guide to testing in this project using Vitest and Testing Library.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Project Structure for Tests](#project-structure-for-tests)
3. [Vitest Configuration](#vitest-configuration)
4. [Writing Tests - Best Practices](#writing-tests---best-practices)
5. [Test Utilities and Helpers](#test-utilities-and-helpers)
6. [Example Tests for Phase 8](#example-tests-for-phase-8)
7. [Test Organization by Feature](#test-organization-by-feature)
8. [Coverage Requirements](#coverage-requirements)
9. [Running Tests](#running-tests)
10. [Integration with CI](#integration-with-ci)

---

## Testing Overview

### Why Testing Matters

Testing is essential for maintaining code quality and preventing regressions. This project uses a comprehensive testing strategy that includes:

- **Reliability**: Catch bugs before they reach production
- **Refactoring Confidence**: Modify code without fear of breaking existing functionality
- **Documentation**: Tests serve as living documentation of expected behavior
- **Faster Development**: Quick feedback loop during development

### Test Pyramid

The project follows the testing pyramid with three levels of tests:

```
                    /\
                   /E2E\          <- Few, expensive, comprehensive
                  /----\
                 /      \
                /Integ-  \        <- Moderate, test feature interactions
               /  ration  \
              /------------\
             /              \
            /     Unit       \    <- Many, fast, focused on single units
           /                  \
          /--------------------\

```

| Level       | Amount | Speed  | Scope                           | Examples                      |
| ----------- | ------ | ------ | ------------------------------- | ----------------------------- |
| Unit        | High   | Fast   | Single function/component       | `hasActiveFilters()` test     |
| Integration | Medium | Medium | Multiple units working together | Filter state + UI interaction |
| E2E         | Low    | Slow   | Full user flow                  | Complete filter workflow      |

### Vitest vs Other Frameworks

Vitest was chosen for this project for several reasons:

| Feature                | Vitest      | Jest                 |
| ---------------------- | ----------- | -------------------- |
| **TypeScript Support** | Native      | Requires config      |
| **Vite Integration**   | Seamless    | Requires transformer |
| **ESM Support**        | First-class | Limited              |
| **Performance**        | Fast        | Slower               |
| **ESBuild**            | Native      | Plugin required      |
| **Hot Module Reload**  | Yes         | No                   |

---

## Project Structure for Tests

### Test Directory Structure

```
tests/
├── setup.ts                 # Global test setup
├── utils/
│   └── test-helpers.ts      # Custom render functions, utilities
├── fixtures/
│   └── filter-fixtures.ts   # Reusable test data
├── unit/
│   └── filters.test.ts      # Unit tests for filter functions
├── components/
│   └── SimplifiedFilters.test.tsx  # Component tests
├── integration/
│   └── .gitkeep             # Integration tests placeholder
└── e2e/
    └── .gitkeep             # E2E tests placeholder
```

### Naming Conventions

| File Type       | Naming Pattern | Example                      |
| --------------- | -------------- | ---------------------------- |
| Unit Tests      | `*.test.ts`    | `filters.test.ts`            |
| Component Tests | `*.test.tsx`   | `SimplifiedFilters.test.tsx` |
| Spec Files      | `*.spec.ts`    | `utils.spec.ts`              |

### Co-location with Source Files

Tests can be placed alongside source files for colocation benefits:

```
src/
├── components/
│   └── SimplifiedFilters/
│       ├── index.ts
│       ├── SimplifiedFilters.tsx
│       └── SimplifiedFilters.test.tsx    # Component tests
└── types/
    ├── index.ts
    ├── filters.ts
    └── filters.test.ts                   # Unit tests
```

**Benefits of colocation:**

- Easier to find related tests
- Tests are updated with code changes
- Clear view of what's tested

---

## Vitest Configuration

### Configuration File (`vitest.config.ts`)

The project includes a comprehensive Vitest configuration:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    // Global test timeout
    testTimeout: 10000,

    // Environment for DOM testing
    environment: 'jsdom',

    // Setup file for global test configuration
    setupFiles: ['./tests/setup.ts'],

    // Include patterns for test files
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      // ... more options
    },
  },
})
```

### Key Configuration Options

| Option              | Value              | Purpose                                  |
| ------------------- | ------------------ | ---------------------------------------- |
| `testTimeout`       | `10000`            | 10 second timeout for async tests        |
| `environment`       | `jsdom`            | Browser-like environment for DOM testing |
| `setupFiles`        | `./tests/setup.ts` | Global setup before all tests            |
| `coverage.provider` | `v8`               | Use V8 coverage engine                   |

---

## Writing Tests - Best Practices

### Arrange-Act-Assert Pattern

Follow the AAA pattern for clear, structured tests:

```typescript
it('should toggle filter state correctly', () => {
  // Arrange
  const initialFilters = createFilterState({ reasoning: true })
  const { handler } = createMockFilterChangeHandler()

  // Act
  renderWithProviders(
    <SimplifiedFilters filters={initialFilters} onChange={handler} />
  )

  const checkbox = screen.getByRole('checkbox', { name: 'Reasoning' })
  fireEvent.click(checkbox)

  // Assert
  expect(handler).toHaveBeenCalledWith(createFilterState())
})
```

### Test Naming Conventions

Use descriptive names that explain **what** is being tested:

```typescript
// Good: Descriptive test names
it('returns false when all filters are undefined')
it('calls onChange when checkbox is clicked')

// Avoid: Vague names
it('works correctly')
it('should test the filter')
```

### One Assertion Per Test

Focus each test on a single behavior:

```typescript
// Good: One assertion per test
it('shows unchecked state when filter is undefined', () => {
  const checkbox = screen.getByRole('checkbox', { name: 'Reasoning' })
  expect(checkbox).not.toBeChecked()
})

it('shows checked state when filter is true', () => {
  const checkbox = screen.getByRole('checkbox', { name: 'Reasoning' })
  expect(checkbox).toBeChecked()
})

// Avoid: Multiple assertions
it('shows correct state and calls handler', () => {
  expect(checkbox).not.toBeChecked()
  expect(handler).toHaveBeenCalled()
  // ... more assertions
})
```

### Descriptive Test Names

Use these patterns for clear test names:

| Pattern                                  | Example                                 |
| ---------------------------------------- | --------------------------------------- |
| `should [expected behavior]`             | `should return false for empty filters` |
| `should [do something] when [condition]` | `should toggle filter when clicked`     |
| `should handle [edge case]`              | `should handle rapid successive clicks` |

### Test Isolation

Each test should be independent:

```typescript
// Good: Clean setup for each test
it('returns true when reasoning filter is active', () => {
  const result = hasActiveFilters({ reasoning: true, ... })
  expect(result).toBe(true)
})

it('returns false when all filters are undefined', () => {
  const result = hasActiveFilters({ reasoning: undefined, ... })
  expect(result).toBe(false)
})

// Avoid: Shared state between tests
let filters: SimpleFiltersState

beforeEach(() => {
  filters = { reasoning: true }
})

it('should toggle correctly', () => {
  // Modifies shared state
  filters.reasoning = !filters.reasoning
  expect(filters.reasoning).toBe(false)
})

it('should handle undefined', () => {
  // Uses modified state - test is not isolated!
  const result = hasActiveFilters(filters)
})
```

---

## Test Utilities and Helpers

### Custom Render Functions

The project provides several render functions for different scenarios:

```typescript
import {
  renderWithProviders, // Full providers (Query + Router)
  renderWithRouter, // Router only
  renderWithoutProviders, // No providers
} from '../utils/test-helpers'
```

| Function                 | Use When                                 |
| ------------------------ | ---------------------------------------- |
| `renderWithProviders`    | Components using React Query and routing |
| `renderWithRouter`       | Components only needing routing          |
| `renderWithoutProviders` | Pure presentational components           |

### Test Fixtures

Reusable test data in `tests/fixtures/`:

```typescript
import {
  FILTER_FIXTURES,
  createFilterState,
  generateRandomFilterState,
} from '../fixtures/filter-fixtures'

// Pre-defined filter states
FILTER_FIXTURES.empty // All undefined
FILTER_FIXTURES.allActive // All true
FILTER_FIXTURES.reasoningOnly // Only reasoning true

// Helper functions
const filters = createFilterState({ reasoning: true })
```

### Mock Helpers

```typescript
import { createMockFilterChangeHandler } from '../fixtures/filter-fixtures'

// Track handler calls
const { handler, calls, getCallCount } = createMockFilterChangeHandler()
handler(newFilters)
expect(getCallCount()).toBe(1)
```

---

## Example Tests for Phase 8

### Unit Tests for `hasActiveFilters` Function

```typescript
// tests/unit/filters.test.ts
import { describe, it, expect } from 'vitest'
import { hasActiveFilters } from '@/types/filters'
import { FILTER_FIXTURES } from '../fixtures/filter-fixtures'

describe('hasActiveFilters', () => {
  it('returns false when all filters are undefined', () => {
    const result = hasActiveFilters(FILTER_FIXTURES.empty)
    expect(result).toBe(false)
  })

  it('returns true when at least one filter is active', () => {
    const result = hasActiveFilters(FILTER_FIXTURES.reasoningOnly)
    expect(result).toBe(true)
  })
})
```

### Component Tests for `SimplifiedFilters`

```typescript
// tests/components/SimplifiedFilters.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { SimplifiedFilters } from '@/components/SimplifiedFilters'
import { renderWithProviders } from '../utils/test-helpers'
import { FILTER_FIXTURES } from '../fixtures/filter-fixtures'

describe('SimplifiedFilters', () => {
  it('renders all three filter checkboxes', () => {
    renderWithProviders(
      <SimplifiedFilters
        filters={FILTER_FIXTURES.empty}
        onChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Filter by reasoning capability')).toBeInTheDocument()
  })

  it('calls onChange when checkbox is clicked', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <SimplifiedFilters
        filters={FILTER_FIXTURES.empty}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByLabelText('Filter by reasoning capability'))
    expect(onChange).toHaveBeenCalledWith({ reasoning: true, toolCall: undefined, openWeights: undefined })
  })
})
```

### Integration Tests for Filter State Management

```typescript
// tests/integration/filter-state.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-helpers'
import { FILTER_FIXTURES } from '../fixtures/filter-fixtures'

describe('Filter State Integration', () => {
  it('maintains filter state across multiple interactions', () => {
    const onChange = vi.fn()
    renderWithProviders(
      <SimplifiedFilters
        filters={FILTER_FIXTURES.empty}
        onChange={onChange}
      />
    )

    // Click reasoning
    fireEvent.click(screen.getByLabelText('Filter by reasoning capability'))
    expect(onChange).toHaveBeenCalledWith(FILTER_FIXTURES.reasoningOnly)
  })
})
```

---

## Test Organization by Feature

### Directory Structure by Type

```
tests/
├── unit/                    # Unit tests
│   └── filters.test.ts
├── components/              # Component tests
│   └── SimplifiedFilters.test.tsx
├── integration/             # Integration tests
│   └── filter-state.test.tsx
└── e2e/                     # E2E tests (future)
    └── filter-workflow.test.ts
```

### Naming by Feature

| Feature    | Test Files                                      |
| ---------- | ----------------------------------------------- |
| Filters    | `filters.test.ts`, `SimplifiedFilters.test.tsx` |
| Search     | `SearchBar.test.tsx`                            |
| Pagination | `PaginationControls.test.tsx`                   |
| API        | `models-api.test.ts`                            |

### Test File Template

```typescript
/**
 * [Feature Name] Tests
 *
 * Brief description of what's being tested.
 */

import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-helpers'
import { FixtureType } from '../fixtures/fixtures'

describe('[Feature]', () => {
  describe('rendering', () => {
    it('should render correctly', () => {
      // Test rendering
    })
  })

  describe('interactions', () => {
    it('should handle user input', () => {
      // Test user interactions
    })
  })

  describe('edge cases', () => {
    it('should handle invalid input', () => {
      // Test edge cases
    })
  })
})
```

---

## Coverage Requirements

### Coverage Thresholds

The project enforces minimum coverage levels:

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

| Metric     | Minimum | Purpose                     |
| ---------- | ------- | --------------------------- |
| Lines      | 80%     | Overall code coverage       |
| Functions  | 80%     | Function coverage           |
| Branches   | 80%     | Conditional branch coverage |
| Statements | 80%     | Statement coverage          |

### Generating Coverage Reports

```bash
# Generate coverage report
npm run test -- --coverage

# Coverage output location
coverage/
├── index.html          # HTML report
├── coverage.json       # JSON report
└── lcov.info          # LCOV format
```

### Viewing Coverage

Open `coverage/index.html` in a browser to see:

- Overall coverage percentage
- Per-file coverage details
- Uncovered lines highlighted

### Minimum Coverage by Type

| Test Type      | Target Coverage         |
| -------------- | ----------------------- |
| Critical paths | 100%                    |
| New features   | 80%+                    |
| Bug fixes      | Specific scenario tests |

---

## Running Tests

### Run All Tests

```bash
# Run all tests once
npm run test

# Run with coverage
npm run test -- --coverage
```

### Run Specific Test File

```bash
# By file path
npm run test -- tests/unit/filters.test.ts

# By pattern
npm run test -- --testNamePattern="hasActiveFilters"
```

### Run Tests in Watch Mode

```bash
# Watch mode (default during development)
npm run test -- --watch

# Watch specific files
npm run test -- --watch --testPathPattern="filters"
```

### Run Tests with Coverage

```bash
# Full coverage report
npm run test -- --coverage

# Coverage only for changed files
npm run test -- --coverage --changed

# Specific reporter
npm run test -- --coverage --reporter=json
```

### Test Runner Options

| Option              | Description         |
| ------------------- | ------------------- |
| `--watch`           | Watch for changes   |
| `--coverage`        | Generate coverage   |
| `--run`             | Run once (no watch) |
| `--testNamePattern` | Filter by test name |
| `--testPathPattern` | Filter by file path |
| `--reporter`        | Specify reporter    |
| `--update`          | Update snapshots    |

---

## Integration with CI

### GitHub Actions Workflow

The project includes CI configuration in `.github/workflows/ci.yml`. Tests run automatically on:

- Every push to `main`
- Every pull request
- Every branch

### Test Results in CI

Test results appear in:

- GitHub Actions tab
- PR checks
- Coverage comments on PRs

### Coverage Reporting

Coverage is automatically:

1. Generated on every test run
2. Reported in CI output
3. Available as HTML artifact
4. Can be integrated with Codecov, Coveralls, etc.

### CI Best Practices

```yaml
# Example CI test step
- name: Run Tests
  run: npm run test -- --run --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## Quick Reference

### Common Testing Library Queries

| Query            | Usage                        |
| ---------------- | ---------------------------- |
| `getByRole`      | Find by ARIA role            |
| `getByLabelText` | Find by label                |
| `getByText`      | Find by text content         |
| `getByTestId`    | Find by data-testid          |
| `queryBy`        | Return null instead of throw |
| `findBy`         | Async find element           |

### Common Assertions

| Assertion             | Description         |
| --------------------- | ------------------- |
| `toBeInTheDocument()` | Element exists      |
| `toBeChecked()`       | Checkbox is checked |
| `toHaveTextContent()` | Element has text    |
| `toHaveClass()`       | Element has class   |
| `toHaveBeenCalled()`  | Function was called |
| `toEqual()`           | Deep equality check |

### File Checklist

- [ ] `vitest.config.ts` - Configured with jsdom and coverage
- [ ] `tests/setup.ts` - Global test setup
- [ ] `tests/utils/test-helpers.ts` - Custom render functions
- [ ] `tests/fixtures/filter-fixtures.ts` - Reusable test data
- [ ] `tests/unit/filters.test.ts` - Unit tests for filters
- [ ] `tests/components/SimplifiedFilters.test.tsx` - Component tests

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library)
- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
